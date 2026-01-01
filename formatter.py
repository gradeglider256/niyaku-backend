import json

# Your documentation block
documentation = """
  GET /auth/profile

  This endpoint retrieves the authenticated user's profile information, specifically tailored for display purposes.

  Request Parameters/Body (DTO)
  This endpoint does not require any request body or query parameters. The user's identity is extracted from the authentication token provided in the request headers (typically via
  req['user'] after JWT verification).
  Successful Response (Status: 200 OK)
  Return Type: SuccessResponse<ProfileForDisplay>
  The getProfileForDisplay method in UserService explicitly selects certain fields from the Profile and Branch entities.
    1 interface SuccessResponse<T> {
    2   message: string;
    3   data?: T;
    4 }
    5 
    6 interface ProfileForDisplay {
    7   id: string;
    8   firstName: string;
    9   middleName: string;
   10   lastName: string;
   11   email: string;
   12   gender: 'male' | 'female';
   13   profile: string;
   14   branchID: number;
   15   dateHired: string;
   16   address: string | null;
   17   mobileNumber: string | null;
   18   branch: {
   19     name: string;
   20     isHeadOffice: boolean;
   21     countryName: string;
   22     countryCode: string;
   23     address: string;
   24     phone: string;
   25     email: string;
   26   };
   27 }

  Example Successful Response:

    1 {
    2   "message": "Profile retrieved",
    3   "data": {
    4     "id": "12345678901234",
    5     "firstName": "John",
    6     "middleName": "A.",
    7     "lastName": "Doe",
    8     "email": "john.doe@example.com",
    9     "gender": "male",
   10     "profile": "default",
   11     "branchID": 1,
   12     "dateHired": "2023-01-01",
   13     "address": "123 Main St",
   14     "mobileNumber": "+1234567890",
   15     "branch": {
   16       "name": "Head Office",
   17       "isHeadOffice": true,
   18       "countryName": "Exampleland",
   19       "countryCode": "EL",
   20       "address": "123 Main Street, Capital City",
   21       "phone": "+1234567890",
   22       "email": "headoffice@example.com"
   23     }
   24   }
   25 }

  Error States
  The endpoint utilizes a GlobalExceptionFilter (src/common/filters/global-exception.filter.ts) to standardize error responses.
  Return Type for Errors: ErrorResponse
   1 interface ErrorResponse {
   2   code: number;    // HTTP status code.
   3   error: string;   // A short, descriptive error message.
   4   message: string; // A more detailed message, often user-friendly.
   5 }



  1. `401 Unauthorized` - User Not Authenticated
   * Description: Occurs if the request does not contain a valid authentication token, or the token is expired/malformed. This is typically handled by a global authentication guard before
     reaching the controller.
   * Triggered by: Lack of valid JWT in the Authorization header.
   * Example Error Response:
   1     {
   2       "code": 401,
   3       "error": "Unauthorized",
   4       "message": "Unauthorized"
   5     }
  2. `404 Not Found` - Profile Not Found
   * Description: Occurs if a profile associated with the authenticated user ID cannot be found in the database.
   * Triggered by: if (!profile) in UserService.getProfileForDisplay.
   * Example Error Response:
   1     {
   2       "code": 404,
   3       "error": "Not Found",
   4       "message": "Profile not found"
   5     }
  3. `500 Internal Server Error` - Unexpected Errors
   * Description: Occurs for any unhandled exceptions or unexpected server-side issues during the profile retrieval process.
   * Triggered by: Any unforeseen errors not explicitly caught by HttpException or other specific error handling.
   * Example Error Response:
   1     {
   2       "code": 500,
   3       "error": "Internal server error",
   4       "message": "An unexpected error occurred"
   5     }
"""



def format_for_jsonl(text):
    # Use json.dumps to handle escaping double quotes and newlines automatically
    escaped_text = json.dumps(text.strip())
    # Strip the leading and trailing quotes added by json.dumps 
    # so you can paste it into your specific JSON structure
    return escaped_text[1:-1]

formatted_doc = format_for_jsonl(documentation)

print("--- COPY THE TEXT BELOW ---")
print(formatted_doc)