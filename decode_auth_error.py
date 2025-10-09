#!/usr/bin/env python3
import base64
import urllib.parse
import sys

def decode_auth_error(error_param):
    """Safely decode Google OAuth authError parameter"""
    if not error_param:
        return "No authError parameter found"
    
    try:
        # Try URL-safe base64 decode
        # Add padding if needed
        padding_needed = 4 - (len(error_param) % 4)
        if padding_needed != 4:
            error_param += '=' * padding_needed
        
        # Replace URL-safe characters
        error_param = error_param.replace('-', '+').replace('_', '/')
        
        decoded_bytes = base64.b64decode(error_param)
        decoded_text = decoded_bytes.decode('utf-8', errors='ignore')
        return decoded_text
        
    except Exception as e:
        try:
            # Try regular base64 decode
            decoded_bytes = base64.b64decode(error_param + '==')
            decoded_text = decoded_bytes.decode('utf-8', errors='ignore')
            return decoded_text
        except Exception as e2:
            return f"Failed to decode: {e}, also tried: {e2}. Raw value: {error_param[:100]}..."

if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = decode_auth_error(sys.argv[1])
        print(result)
    else:
        print("Usage: python3 decode_auth_error.py <authError_value>")
        print("Or paste the authError value when prompted:")
        error_param = input("Paste authError value: ").strip()
        result = decode_auth_error(error_param)
        print("\nDecoded result:")
        print(result)
