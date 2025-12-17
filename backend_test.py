#!/usr/bin/env python3
"""
Backend API Testing for Dental Site
Tests all the API endpoints as specified in the review request.
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend .env
BASE_URL = "https://sourire-seysses.preview.emergentagent.com/api"

def test_api_endpoint(method, endpoint, data=None, expected_status=200, description=""):
    """Helper function to test API endpoints"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{'='*60}")
    print(f"Testing: {method} {endpoint}")
    print(f"Description: {description}")
    print(f"URL: {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        # Check CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        print(f"CORS Headers: {cors_headers}")
        
        if response.status_code == expected_status:
            try:
                response_json = response.json()
                print(f"Response JSON: {json.dumps(response_json, indent=2, default=str)}")
                print(f"✅ SUCCESS: {method} {endpoint}")
                return response_json
            except json.JSONDecodeError:
                print(f"Response Text: {response.text}")
                print(f"✅ SUCCESS: {method} {endpoint} (non-JSON response)")
                return response.text
        else:
            print(f"❌ FAILED: Expected status {expected_status}, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ REQUEST ERROR: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return False

def main():
    """Main testing function"""
    print("🧪 Starting Backend API Tests for Dental Site")
    print(f"Base URL: {BASE_URL}")
    
    test_results = []
    
    # Test 1: GET /api/ - Hello World
    print("\n" + "="*80)
    print("TEST 1: Root endpoint")
    result = test_api_endpoint("GET", "/", description="Should return Hello World message")
    test_results.append(("GET /api/", result is not False))
    
    if result and isinstance(result, dict):
        if result.get("message") == "Hello World":
            print("✅ Correct message returned")
        else:
            print(f"❌ Expected 'Hello World', got: {result.get('message')}")
    
    # Test 2: GET /api/site-content
    print("\n" + "="*80)
    print("TEST 2: Get site content")
    site_content = test_api_endpoint("GET", "/site-content", description="Should return site content with practice info")
    test_results.append(("GET /api/site-content", site_content is not False))
    
    if site_content and isinstance(site_content, dict):
        # Validate required fields
        required_fields = ["key", "content"]
        for field in required_fields:
            if field in site_content:
                print(f"✅ Field '{field}' present")
            else:
                print(f"❌ Missing required field: {field}")
        
        # Check if key is 'default'
        if site_content.get("key") == "default":
            print("✅ Key is 'default' as expected")
        else:
            print(f"❌ Expected key 'default', got: {site_content.get('key')}")
        
        # Check content structure
        content = site_content.get("content", {})
        expected_sections = ["practice", "hero", "practical"]
        for section in expected_sections:
            if section in content:
                print(f"✅ Content section '{section}' present")
                if section == "practice" and "name" in content[section] and "address" in content[section]:
                    print(f"✅ Practice has name and address")
                elif section == "hero" and "title" in content[section]:
                    print(f"✅ Hero has title")
                elif section == "practical" and "hours" in content[section] and isinstance(content[section]["hours"], list):
                    print(f"✅ Practical has hours array")
            else:
                print(f"❌ Missing content section: {section}")
    
    # Test 3: PUT /api/site-content - Update content
    print("\n" + "="*80)
    print("TEST 3: Update site content")
    
    if site_content and isinstance(site_content, dict):
        # Create a small update - change hero title
        updated_content = site_content.get("content", {}).copy()
        original_title = updated_content.get("hero", {}).get("title", "")
        new_title = f"Updated Title - {datetime.now().strftime('%H:%M:%S')}"
        
        if "hero" not in updated_content:
            updated_content["hero"] = {}
        updated_content["hero"]["title"] = new_title
        
        update_payload = {"content": updated_content}
        
        print(f"Original title: {original_title}")
        print(f"New title: {new_title}")
        
        put_result = test_api_endpoint("PUT", "/site-content", data=update_payload, description="Update hero title")
        test_results.append(("PUT /api/site-content", put_result is not False))
        
        if put_result:
            # Verify the update was applied
            print("\n--- Verifying update persistence ---")
            updated_site_content = test_api_endpoint("GET", "/site-content", description="Verify update persistence")
            
            if updated_site_content and isinstance(updated_site_content, dict):
                updated_title = updated_site_content.get("content", {}).get("hero", {}).get("title", "")
                if updated_title == new_title:
                    print("✅ Update persisted correctly")
                else:
                    print(f"❌ Update not persisted. Expected: {new_title}, Got: {updated_title}")
    else:
        print("❌ Skipping PUT test - GET site-content failed")
        test_results.append(("PUT /api/site-content", False))
    
    # Test 4: POST /api/contact-messages
    print("\n" + "="*80)
    print("TEST 4: Create contact message")
    
    contact_payload = {
        "fullname": "Dr. Jean Dupont",
        "email": "jean.dupont@example.com",
        "phone": "0123456789",
        "message": "Bonjour, je souhaiterais prendre rendez-vous pour un contrôle dentaire. Merci.",
        "consent": True
    }
    
    contact_result = test_api_endpoint("POST", "/contact-messages", data=contact_payload, 
                                    description="Create new contact message")
    test_results.append(("POST /api/contact-messages", contact_result is not False))
    
    created_message_id = None
    if contact_result and isinstance(contact_result, dict):
        # Validate response structure
        required_fields = ["id", "created_at", "fullname", "email", "phone", "message", "consent"]
        for field in required_fields:
            if field in contact_result:
                print(f"✅ Field '{field}' present in response")
            else:
                print(f"❌ Missing field in response: {field}")
        
        created_message_id = contact_result.get("id")
        print(f"Created message ID: {created_message_id}")
    
    # Test 5: GET /api/contact-messages
    print("\n" + "="*80)
    print("TEST 5: List contact messages")
    
    messages_result = test_api_endpoint("GET", "/contact-messages?limit=5", 
                                      description="Get contact messages with limit")
    test_results.append(("GET /api/contact-messages", messages_result is not False))
    
    if messages_result and isinstance(messages_result, list):
        print(f"✅ Received {len(messages_result)} messages")
        
        # Check if our created message is in the list
        if created_message_id:
            found_message = False
            for msg in messages_result:
                if msg.get("id") == created_message_id:
                    found_message = True
                    print("✅ Created message found in list")
                    break
            
            if not found_message:
                print("❌ Created message not found in list")
        
        # Validate message structure
        if messages_result:
            sample_msg = messages_result[0]
            required_fields = ["id", "created_at", "fullname", "email", "phone", "message", "consent"]
            for field in required_fields:
                if field in sample_msg:
                    print(f"✅ Message field '{field}' present")
                else:
                    print(f"❌ Missing message field: {field}")
    else:
        print("❌ Expected array of messages")
    
    # Test 6: POST /api/appointment-requests
    print("\n" + "="*80)
    print("TEST 6: Create appointment request")
    
    appointment_payload = {
        "fullname": "Test Patient",
        "email": "test@example.com",
        "phone": "0612345678",
        "reason": "Contrôle",
        "preferred_days": ["Lundi", "Mercredi"],
        "preferred_time": "Matin",
        "notes": "Disponibilité limitée",
        "consent": True
    }
    
    appointment_result = test_api_endpoint("POST", "/appointment-requests", data=appointment_payload, 
                                        description="Create new appointment request")
    test_results.append(("POST /api/appointment-requests", appointment_result is not False))
    
    created_appointment_id = None
    if appointment_result and isinstance(appointment_result, dict):
        # Validate response structure
        required_fields = ["id", "created_at"]
        for field in required_fields:
            if field in appointment_result:
                print(f"✅ Field '{field}' present in response")
            else:
                print(f"❌ Missing field in response: {field}")
        
        # Validate all input fields are returned
        input_fields = ["fullname", "email", "phone", "reason", "preferred_days", "preferred_time", "notes", "consent"]
        for field in input_fields:
            if field in appointment_result:
                print(f"✅ Input field '{field}' present in response")
            else:
                print(f"❌ Missing input field in response: {field}")
        
        created_appointment_id = appointment_result.get("id")
        print(f"Created appointment ID: {created_appointment_id}")
    
    # Test 7: GET /api/appointment-requests
    print("\n" + "="*80)
    print("TEST 7: List appointment requests")
    
    appointments_result = test_api_endpoint("GET", "/appointment-requests?limit=5", 
                                          description="Get appointment requests with limit")
    test_results.append(("GET /api/appointment-requests", appointments_result is not False))
    
    if appointments_result and isinstance(appointments_result, list):
        print(f"✅ Received {len(appointments_result)} appointment requests")
        
        # Check if our created appointment is in the list
        if created_appointment_id:
            found_appointment = False
            for appt in appointments_result:
                if appt.get("id") == created_appointment_id:
                    found_appointment = True
                    print("✅ Created appointment request found in list")
                    break
            
            if not found_appointment:
                print("❌ Created appointment request not found in list")
        
        # Validate appointment structure
        if appointments_result:
            sample_appt = appointments_result[0]
            required_fields = ["id", "created_at", "fullname", "phone", "reason", "consent"]
            for field in required_fields:
                if field in sample_appt:
                    print(f"✅ Appointment field '{field}' present")
                else:
                    print(f"❌ Missing appointment field: {field}")
        
        # Verify sorting by created_at desc (most recent first)
        if len(appointments_result) > 1:
            is_sorted = True
            for i in range(len(appointments_result) - 1):
                current_time = appointments_result[i].get("created_at", "")
                next_time = appointments_result[i + 1].get("created_at", "")
                if current_time < next_time:
                    is_sorted = False
                    break
            
            if is_sorted:
                print("✅ Appointment requests properly sorted by created_at desc")
            else:
                print("❌ Appointment requests not properly sorted")
    else:
        print("❌ Expected array of appointment requests")
    
    # Summary
    print("\n" + "="*80)
    print("🏁 TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, success in test_results if success)
    total = len(test_results)
    
    for test_name, success in test_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)