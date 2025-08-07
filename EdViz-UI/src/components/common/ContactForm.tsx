import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Snackbar, Alert, CircularProgress } from '@mui/material';

interface ContactFormProps {
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Validation function
  const validate = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return 'All fields are required.';
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      return 'Please enter a valid email address.';
    }
    if (formData.message.length < MIN_MESSAGE_LENGTH) {
      return `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setSnackbar({
        open: true,
        message: `Validation error: ${validationError}`,
        severity: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      let response;
      try {
        response = await fetch('http://localhost:8000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          signal: controller.signal
        });
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('timeout');
        } else {
          throw new Error('network');
        }
      } finally {
        clearTimeout(timeout);
      }
      if (response.ok) {
        const data = await response.json();
        setSnackbar({
          open: true,
          message: data.message || 'Message sent successfully! We\'ll get back to you soon.',
          severity: 'success'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        let errorMsg = `Backend error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMsg = `Backend error: ${errorData.detail}`;
          } else if (errorData.message) {
            errorMsg = `Backend error: ${errorData.message}`;
          }
        } catch {
          // Not JSON
        }
        setSnackbar({
          open: true,
          message: errorMsg,
          severity: 'error'
        });
      }
    } catch (error: any) {
      if (error.message === 'timeout') {
        setSnackbar({
          open: true,
          message: 'Request timed out while contacting the backend. Please try again.',
          severity: 'error'
        });
      } else if (error.message === 'network') {
        setSnackbar({
          open: true,
          message: 'Network error: Could not reach the backend. Please check your connection or backend server.',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Unexpected error: ${error.message || error}`,
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 350 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        Have questions or need support? We're here to help!
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            name="name"
            placeholder="Name"
            variant="filled"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiFilledInput-root': {
                backgroundColor: '#f5f5f5',
                '&:hover, &.Mui-focused': {
                  backgroundColor: '#f5f5f5',
                }
              },
              '& .MuiFilledInput-input': {
                padding: '16px',
              },
              '& .MuiInputLabel-root': {
                display: 'none'
              }
            }}
          />
          <TextField
            name="email"
            placeholder="Email"
            variant="filled"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiFilledInput-root': {
                backgroundColor: '#f5f5f5',
                '&:hover, &.Mui-focused': {
                  backgroundColor: '#f5f5f5',
                }
              },
              '& .MuiFilledInput-input': {
                padding: '16px',
              },
              '& .MuiInputLabel-root': {
                display: 'none'
              }
            }}
          />
        </Box>
        <TextField
          name="subject"
          placeholder="Subject"
          variant="filled"
          value={formData.subject}
          onChange={handleChange}
          disabled={loading}
          required
          sx={{
            backgroundColor: '#f5f5f5',
            '& .MuiFilledInput-root': {
              backgroundColor: '#f5f5f5',
              '&:hover, &.Mui-focused': {
                backgroundColor: '#f5f5f5',
              }
            },
            '& .MuiFilledInput-input': {
              padding: '16px',
            },
            '& .MuiInputLabel-root': {
              display: 'none'
            }
          }}
        />
        <TextField
          name="message"
          placeholder="Message"
          variant="filled"
          multiline
          required
          rows={6}
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
          sx={{
            backgroundColor: '#f5f5f5',
            '& .MuiFilledInput-root': {
              backgroundColor: '#f5f5f5',
              '&:hover, &.Mui-focused': {
                backgroundColor: '#f5f5f5',
              }
            },
            '& .MuiFilledInput-input': {
              padding: '16px',
            },
            '& .MuiInputLabel-root': {
              display: 'none'
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            alignSelf: 'flex-start',
            backgroundColor: '#333',
            color: 'white',
            px: 4,
            py: 1,
            '&:hover': {
              backgroundColor: '#222',
            },
            position: 'relative',
            minWidth: 140
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send Message'}
        </Button>
      </Box>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%', color: snackbar.severity === 'success' ? 'green' : 'red' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/*
        Testing Instructions:
        - Test with valid data (should succeed and clear form)
        - Test with invalid email (should show error)
        - Test with empty fields (should show error)
        - Test with very long messages (should succeed)
        - Test network error handling (disable network, should show error)
        - Verify email is received at configured team email
      */}
    </Box>
  );
};

export default ContactForm; 