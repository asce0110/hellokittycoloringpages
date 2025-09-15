#!/bin/bash
# Install email service packages

echo "Installing email service packages..."

# Resend (recommended - modern, reliable)
npm install resend

# SendGrid (popular choice)
npm install @sendgrid/mail

# Nodemailer (SMTP option)
npm install nodemailer
npm install -D @types/nodemailer

echo "Email packages installed successfully!"
echo ""
echo "Available providers:"
echo "1. Resend - Modern, reliable (recommended)"
echo "2. SendGrid - Popular, established"
echo "3. Nodemailer - SMTP, works with any email provider"
echo ""
echo "Configure your .env file with:"
echo "EMAIL_PROVIDER=resend|sendgrid|nodemailer"
echo "EMAIL_API_KEY=your-api-key"
echo "EMAIL_FROM=noreply@yourdomain.com"