# Bhindi Webhook Dashboard

## Description
Users can create, list, and trigger webhooks.

## Getting Started
1. Clone the repo  
   ```bash
   git clone https://github.com/your-org/bhindi_webhook.git
   cd bhindi_webhook
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Configure environment  
   - Copy `.env.example` to `.env`  
   - Set your database URL in `.env`:  
     ```bash
     DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/dbname"
     ```

4. Generate & run migrations  
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start development server  
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.  

## Usage
- Visit `/` to view or create webhooks  
- Visit `/webhook` to see your list  
- Trigger webhooks by hitting your generated URL  

## Webhook Types

There are two webhook trigger types you can configure:

### 1. Dynamic Webhooks
Dynamic webhooks are flexible and allow you to send different prompts each time you trigger them. They're perfect for:
- One-off automation tasks
- Varied data processing needs
- Ad-hoc report generation
- Custom AI interactions

#### Example Use Cases:
1. **Data Analysis**
   ```json
   {
     "authToken": "your_token",
     "prompt": "Analyze today's sales data and highlight top performing products"
   }
   ```

2. **Content Generation**
   ```json
   {
     "authToken": "your_token",
     "prompt": "Write a social media post about our new product launch"
   }
   ```

3. **AI Assistant Tasks**
   ```json
   {
     "authToken": "your_token",
     "prompt": "Summarize the meeting transcript and create action items"
   }
   ```

### 2. Text-based Webhooks
Text-based webhooks use predefined templates with variables. They're ideal for:
- Standardized notifications
- Regular reports with changing data
- System integrations
- Automated messages

#### How Templates Work:
1. **Define your template in the UI:**
   ```
   Hello ${userName},
   
   Your order #${orderId} has been ${status}.
   Total amount: $${data.amount}
   Shipping to: ${address.street}, ${address.city}
   
   Track your order: ${trackingUrl}
   ```

2. **Trigger with data:**
   ```json
   {
     "authToken": "your_token",
     "userName": "Alice Smith",
     "orderId": "ORD-12345",
     "status": "shipped",
     "data": {
       "amount": 149.99
     },
     "address": {
       "street": "123 Main St",
       "city": "San Francisco"
     },
     "trackingUrl": "https://track.shipping.com/ORD-12345"
   }
   ```

3. **Result:**
   ```
   Hello Alice Smith,
   
   Your order #ORD-12345 has been shipped.
   Total amount: $149.99
   Shipping to: 123 Main St, San Francisco
   
   Track your order: https://track.shipping.com/ORD-12345
   ```

#### More Text-based Examples:

1. **Inventory Alert**
   Template:
   ```
   ALERT: ${product.name} stock is ${stock.level}
   Current quantity: ${stock.quantity}
   Reorder point: ${stock.reorderPoint}
   Last updated: ${timestamp}
   ```

2. **Meeting Reminder**
   Template:
   ```
   Meeting Reminder: ${meeting.title}
   Time: ${meeting.time}
   Location: ${location.room}, ${location.floor}
   Agenda: ${agenda}
   ```

Key Differences:
- Dynamic webhooks: New prompt each time
- Text-based webhooks: Fixed structure, variable data
- Dynamic: More flexible but less structured
- Text-based: More structured but less flexible

## Authentication

To interact with the webhooks API, you'll need an authentication token. The application uses cookie-based authentication.

### Getting Your Auth Token

```javascript
// Use this function in your browser console
async function getAuthToken() {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token_v2'));
  return tokenCookie ? tokenCookie.split('=')[1].trim() : null;
}
```

## Webhook Types

The API supports two types of webhooks:

### 1. Dynamic Webhooks
- Flexible webhooks where you provide a new prompt each time
- Ideal for one-off or varied automation tasks
- Requires a `prompt` field in the request body

### 2. Text-based Webhooks
- Template-based webhooks with predefined structure
- Uses variables in the format `${variableName}`
- Values for variables are provided when triggering
- No `prompt` field needed, just provide the variable values

## API Endpoints

### POST /api/webhook-lifecycle

This endpoint triggers your webhook execution.

#### Request Details:

**URL:**
```
POST http://localhost:3000/api/webhook-lifecycle?triggerId=<TRIGGER_ID>
```

**Headers:**
```
Content-Type: application/json
```

#### Request Body Examples:

1. For Dynamic Webhooks:
```json
{
    "authToken": "<YOUR_AUTH_TOKEN>",
    "prompt": "Generate a summary of today's sales data"
}
```

2. For Text-based Webhooks:
```json
{
    "authToken": "<YOUR_AUTH_TOKEN>",
    "userName": "Alice",
    "orderId": "12345",
    "data": {
        "amount": 100
    }
}
```

#### Response:
```json
{
    "success": true,
    "triggerData": {
        "title": "Webhook Name",
        "type": "Dynamic|Textbased",
        "prompt": "..."
    },
    "externalWebhook": {
        // webhook details
    },
    "triggerRun": {
        // execution details
    },
    "cronExpression": null
}
```

### Using Postman

1. Create a new request:
   - Method: **POST**
   - URL: `http://localhost:3000/api/webhook-lifecycle?triggerId=<YOUR_TRIGGER_ID>`

2. Add Headers:
   - Key: `Content-Type`
   - Value: `application/json`

3. Add Body:
   - Select: `raw`
   - Type: `JSON`
   - Content: Use one of the example bodies above

4. Add your auth token:
   - Replace `<YOUR_AUTH_TOKEN>` with your actual token

5. Send the request

### Example cURL Commands

1. Dynamic Webhook:
```bash
curl -X POST "http://localhost:3000/api/webhook-lifecycle?triggerId=abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "authToken":"your_auth_token_here",
    "prompt":"Generate a weekly report"
  }'
```

2. Text-based Webhook:
```bash
curl -X POST "http://localhost:3000/api/webhook-lifecycle?triggerId=xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "authToken":"your_auth_token_here",
    "userName":"John",
    "orderId":"ORD-123",
    "data": {
        "status":"completed"
    }
  }'
  ```