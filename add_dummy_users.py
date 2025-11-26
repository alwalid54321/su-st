import requests
import json
import random
import string

BASE_URL = "http://localhost:3000/api/auth/register"

def generate_random_string(length=10):
    return ''.join(random.choice(string.ascii_letters) for _ in range(length))

def generate_strong_password():
    chars = string.ascii_letters + string.digits + string.punctuation
    password = [
        random.choice(string.ascii_uppercase),
        random.choice(string.ascii_lowercase),
        random.choice(string.digits),
        random.choice(string.punctuation)
    ]
    password.extend(random.choice(chars) for _ in range(random.randint(4, 8))) # Ensure min 8 chars
    random.shuffle(password)
    return ''.join(password)

def add_dummy_users(num_users=5):
    print(f"Adding {num_users} dummy users...")
    for i in range(num_users):
        username = f"testuser{generate_random_string(5)}"
        email = f"test{generate_random_string(5)}@example.com"
        password = generate_strong_password()
        first_name = f"First{i}"
        last_name = f"Last{i}"

        user_data = {
            "username": username,
            "email": email,
            "password": password,
            "firstName": first_name,
            "lastName": last_name
        }

        try:
            response = requests.post(BASE_URL, json=user_data)
            response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
            print(f"Successfully created user: {username}")
            print(f"Response: {response.json()}")
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred for {username}: {http_err}")
            print(f"Response content: {response.text}")
        except requests.exceptions.ConnectionError as conn_err:
            print(f"Connection error occurred: {conn_err}. Is the Next.js app running on {BASE_URL}?")
        except requests.exceptions.Timeout as timeout_err:
            print(f"Timeout error occurred: {timeout_err}")
        except requests.exceptions.RequestException as req_err:
            print(f"An unexpected error occurred: {req_err}")

    print("Dummy user generation complete.")

if __name__ == "__main__":
    # Before running this script, ensure your Next.js application is running
    # (e.g., by running `npm run dev` in the `nextjs-app` directory)
    add_dummy_users(num_users=5)
