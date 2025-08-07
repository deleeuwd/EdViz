import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Email configuration
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.team_email = os.getenv('TEAM_EMAIL')
        
        if not all([self.smtp_username, self.smtp_password, self.team_email]):
            logger.warning("Email configuration is incomplete. Contact form will not work.")
    
    def send_contact_email(self, name: str, email: str, subject: str, message: str) -> bool:
        """
        Send a contact form email to the team
        """
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = self.team_email
            msg['Reply-To'] = email
            msg['Subject'] = f"Contact Form: {subject}"
            
            # Create email body
            body = f"""
            New contact form submission:
            
            From: {name} <{email}>
            Subject: {subject}
            
            Message:
            {message}
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Connect to SMTP server and send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Contact form email sent successfully from {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send contact form email: {str(e)}")
            return False 