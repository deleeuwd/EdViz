import httpx
import json
import logging
from typing import Dict, Any, Optional, Protocol
import os
from dotenv import load_dotenv
import re
from abc import ABC, abstractmethod
import openai
from openai import AsyncOpenAI

load_dotenv()

logger = logging.getLogger(__name__)

class AIClient(ABC):
    """Abstract base class for AI API clients"""
    @abstractmethod
    async def generate_comprehensive_text(self, text: str) -> str:
        pass
    
    @abstractmethod
    async def generate_graph_json(self, text: str) -> Dict[str, Any]:
        pass

class DeepSeekClient(AIClient):
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = 90
        self.max_retries = 3
        self.max_text_length = 6000

    async def _make_api_request(self, endpoint: str, payload: Dict[str, Any], retry_count: int = 0) -> Dict[str, Any]:
        """Make API request with retry logic"""
        logger.debug(f"Making DeepSeek request to {self.base_url}/{endpoint}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 401:
                    raise ValueError("Invalid API key")
                elif response.status_code == 404:
                    raise ValueError("Invalid API endpoint")
                elif response.status_code == 422:
                    try:
                        error_data = json.loads(response.text)
                        error_detail = error_data.get('detail', 'Unknown error')
                    except json.JSONDecodeError:
                        error_detail = response.text
                    raise ValueError(f"API validation error: {error_detail}")
                
                response.raise_for_status()
                return response.json()
                
        except httpx.TimeoutException:
            if retry_count < self.max_retries:
                logger.warning(f"Request timed out, retrying... (attempt {retry_count + 1}/{self.max_retries})")
                return await self._make_api_request(endpoint, payload, retry_count + 1)
            raise
        except Exception as e:
            logger.error(f"DeepSeek API error: {str(e)}")
            raise

    async def generate_comprehensive_text(self, text: str) -> str:
        prompt_prefix = "You are an expert educational content generator. Your task is to write a comprehensive, well-structured explanatory text that connects and explains a list of given concepts in a way that is ideal for generating a concept map. The output must: Define and explain each concept clearly. Explicitly describe the relationships between concepts Use varied and specific linking phrases to represent different types of relationships, such as: Hierarchical: is a type of, is part of, belongs to. Causal: leads to, causes, results in, is triggered by. Functional: is used for, enables, facilitates, supports. Associative: is related to, correlates with, interacts with. Definitional: is defined as, refers to, means. Comparative: is similar to, differs from, contrasts with. Ensure each sentence can be easily converted into a concept map structure using node-link-node format. Organize the text in a logical flow, either hierarchical, causal, or thematic depending on the topic. Ensure each sentence can be translated into a node-link-node format for concept map generation."
        
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": prompt_prefix
                },
                {
                    "role": "user",
                    "content": f"{text}. \n\n Make sure it is not to long for an API request"
                }
            ],
            "max_tokens": 6000,
            "temperature": 0.7
        }
        
        response = await self._make_api_request("chat/completions", payload)
        return response["choices"][0]["message"]["content"].strip()

    async def generate_graph_json(self, text: str) -> Dict[str, Any]:
        payload = {
            "prompt": f"""You are an AI assistant that outputs JSON for a concept graph.
            Your task is to generate a valid JSON object that contains only two keys: "nodes" and "links".
            Each node must have: id (string), name (string), group (number).
            Each link must have: source (string), target (string), type (string), and description (string).
            Return ONLY valid JSON — no explanations, no markdown, no extra text.
            Here is the input text: {text} """,
            "max_tokens": 6000,
            "temperature": 0.7,
            "model": "deepseek-chat"
        }
        
        response = await self._make_api_request("completions", payload)
        return extract_graph_json_from_text(response["choices"][0]["text"].strip())

class OpenAIClient(AIClient):
    def __init__(self, api_key: str, model: str):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.max_text_length = 6000

    async def generate_comprehensive_text(self, text: str) -> str:
        prompt_prefix = "You are an expert educational content generator. Your task is to write a comprehensive, well-structured explanatory text that connects and explains a list of given concepts in a way that is ideal for generating a concept map. The output must: Define and explain each concept clearly. Explicitly describe the relationships between concepts Use varied and specific linking phrases to represent different types of relationships, such as: Hierarchical: is a type of, is part of, belongs to. Causal: leads to, causes, results in, is triggered by. Functional: is used for, enables, facilitates, supports. Associative: is related to, correlates with, interacts with. Definitional: is defined as, refers to, means. Comparative: is similar to, differs from, contrasts with. Ensure each sentence can be easily converted into a concept map structure using node-link-node format. Organize the text in a logical flow, either hierarchical, causal, or thematic depending on the topic. Ensure each sentence can be translated into a node-link-node format for concept map generation."

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt_prefix},
                    {"role": "user", "content": f"{text}. \n\n Make sure it is not to long for an API request"}
                ],
                max_tokens=10000,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise

    async def generate_graph_json(self, text: str) -> Dict[str, Any]:
        prompt = f"""You are an AI assistant that outputs JSON for a concept graph.
        Your task is to generate a valid JSON object that contains only two keys: "nodes" and "links".
        Each node must have: id (string), name (string), group (number).
        Each link must have: source (string), target (string), type (string), and description (string).
        The description field for each link must be informative and specific about the relationship between the nodes. Avoid generic or uninformative relationship labels such as 'relation', 'related to', 'connection', or similar vague terms. Do not use the same relationship word or phrase more than 4 times in the entire graph, even if it is a good one. Use a diverse set of relationship descriptions that are contextually appropriate and meaningful for each edge.
        Return ONLY valid JSON — no explanations, no markdown, no extra text.
        Here is the input text: {text}"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a JSON generator that only outputs valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=6000,
                temperature=0.7
            )
            return extract_graph_json_from_text(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise

def extract_graph_json_from_text(response_text: str) -> Dict[str, Any]:
    """Extract the graph JSON (nodes and links) from a text response."""
    logger.debug("Will extract graph from json")
    try:
        # Find all JSON objects in the text
        json_objects = []
        stack = []
        start = None
        
        for i, c in enumerate(response_text):
            if c == '{':
                if not stack:  # Start of a new object
                    start = i
                stack.append(c)
            elif c == '}':
                if stack:
                    stack.pop()
                    if not stack and start is not None:  # End of an object
                        try:
                            json_str = response_text[start:i+1]
                            json_obj = json.loads(json_str)
                            if "nodes" in json_obj and "links" in json_obj:
                                json_objects.append(json_obj)
                        except json.JSONDecodeError:
                            continue
                        start = None
        
        if not json_objects:
            raise ValueError("No valid graph JSON found in response")
        
        # Return the first valid graph JSON found
        return json_objects[0]
        
    except Exception as e:
        logger.error(f"Error extracting graph JSON: {str(e)}")
        raise

class AIProcessor:
    def __init__(self):
        # Get enabled status for each AI client
        self.use_openai = os.getenv("ENABLE_OPENAI", "false").lower() == "true"
        self.use_deepseek = os.getenv("ENABLE_DEEPSEEK", "true").lower() == "true"
        self.client: Optional[AIClient] = None
        
        # Try OpenAI first if enabled
        if self.use_openai:
            openai_api_key = os.getenv("OPENAI_API_KEY")
            openai_model = os.getenv("OPENAI_MODEL", "gpt-4")
            
            if openai_api_key:
                self.client = OpenAIClient(openai_api_key, openai_model)
                logger.info("Initialized OpenAI client")
            else:
                logger.warning("OpenAI API key not found, falling back to DeepSeek")
                self.use_openai = False
        
        # Fall back to DeepSeek if OpenAI is not enabled or failed
        if not self.use_openai and self.use_deepseek:
            deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
            deepseek_base_url = os.getenv("DEEPSEEK_API_URL")
            
            if not deepseek_api_key or not deepseek_base_url:
                raise ValueError("DEEPSEEK_API_KEY and DEEPSEEK_API_URL must be set when using DeepSeek")
            
            self.client = DeepSeekClient(deepseek_api_key, deepseek_base_url)
            logger.info("Initialized DeepSeek client")
        
        # If no client could be initialized
        if not self.client:
            raise ValueError("No AI client could be initialized. Please enable at least one AI provider and provide valid credentials.")

    def _validate_text(self, text: str) -> str:
        """Validate and truncate text if necessary"""
        try:
            number_patterns = [
                r'\d+\s+\d+',  # Numbers split by whitespace
                r'\d+[,\.]\s+\d+',  # Decimal numbers split by whitespace
                r'[oO]ne|[tT]wo|[tT]hree|[fF]our|[fF]ive|[sS]ix|[sS]even|[eE]ight|[nN]ine|[zZ]ero',  # Text numbers that should be digits
            ]
            
            for pattern in number_patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    logger.warning(f"Potentially malformed number detected: '{match.group()}' at position {match.start()}")
            
            max_length = 6000  # Use the same max length for both clients
            if len(text) > max_length:
                logger.warning(f"Text length ({len(text)}) exceeds maximum ({max_length}). Truncating.")
                return text[:max_length]
            return text
        except Exception as e:
            logger.error(f"Failed to validate text: {str(e)}")
            raise

    async def generate_comprehensive_text(self, raw_text: str) -> str:
        """Generate comprehensive text from raw PDF text"""
        try:
            validated_text = self._validate_text(raw_text)
            return await self.client.generate_comprehensive_text(validated_text)
        except Exception as e:
            logger.error(f"Error generating comprehensive text: {str(e)}")
            raise

    async def generate_graph_json(self, comprehensive_text: str) -> Dict[str, Any]:
        """Generate graph JSON from comprehensive text"""
        try:
            validated_text = self._validate_text(comprehensive_text)
            return await self.client.generate_graph_json(validated_text)
        except Exception as e:
            logger.error(f"Error generating graph JSON: {str(e)}")
            raise