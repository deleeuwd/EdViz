import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Snackbar, Alert } from '@mui/material';
import BaseLayout from '../../components/layout/BaseLayout';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.message) {
      setSnackbar({
        open: true,
        message: 'Please fill in at least email and message fields',
        severity: 'error'
      });
      return;
    }

    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful submission
      console.log('Form submitted:', formData);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Message sent successfully! We\'ll get back to you soon.',
        severity: 'success'
      });

      // Clear form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <BaseLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            sx={{
              alignSelf: 'flex-start',
              backgroundColor: '#333',
              color: 'white',
              px: 4,
              py: 1,
              '&:hover': {
                backgroundColor: '#222',
              }
            }}
          >
            Send Message
          </Button>
        </Box>
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BaseLayout>
  );
};

export default Contact; 