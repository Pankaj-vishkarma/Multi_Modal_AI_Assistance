# AI Assistant | Multimodal Chat UI

A modern, responsive AI chat interface built with Next.js that supports multimodal interactions (text, images, videos, audio, PDFs) with streaming responses and real-time media uploads.

## Features

✨ **Multimodal Support**
- Chat about images, videos, audio files, and PDFs
- Real-time media preview in the chat window
- Drag-and-drop file uploads with progress tracking

🚀 **Streaming Chat**
- Real-time streaming responses using Server-Sent Events (SSE)
- Word-by-word display for natural reading experience
- Conversation history context management

🎨 **Modern Design**
- Glassmorphism UI with dark theme
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Three-column layout on desktop, single column on mobile

📱 **Responsive Architecture**
- Mobile sidebar with toggle
- Optimized for all screen sizes
- Touch-friendly interface

🔌 **Backend Integration**
- Proxy-based API communication
- Connects to localhost:5000 backend
- Upload handling through Next.js route handlers
- Media analysis through dedicated API endpoint

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (with TypeScript support)
- **Styling**: Tailwind CSS with custom configurations
- **State Management**: React hooks (useChat, useUpload)
- **API**: Next.js Route Handlers, Fetch API
- **File Storage**: Public directory with random naming

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.js         # Chat streaming endpoint
│   │   ├── upload/route.js       # File upload handler
│   │   └── analyze/route.js      # Media analysis endpoint
│   ├── page.js                    # Main chat interface
│   ├── layout.tsx                 # Root layout with metadata
│   └── globals.css                # Tailwind CSS setup
├── components/
│   ├── ChatMessage.js             # Message display with media preview
│   ├── ChatWindow.js              # Chat history scrollable container
│   ├── ChatInput.js               # Text input with attachment display
│   ├── MediaUploader.js           # Drag-and-drop file upload
│   ├── Header.js                  # Top header with clear chat
│   └── Sidebar.js                 # Navigation sidebar (mobile/desktop)
├── hooks/
│   ├── useChat.js                 # Chat state and streaming logic
│   └── useUpload.js               # File upload state management
├── lib/
│   └── api.js                     # API client functions
└── public/
    └── uploads/                   # Uploaded media storage
```

## Installation & Setup

### 1. Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Backend server running at `localhost:5000`

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Backend Configuration

Ensure your backend server is running on `http://localhost:5000` with the following endpoints:

**POST /chat**
- Request: `{ message: string, conversationHistory: Array }`
- Response: Server-Sent Events stream with `data: { content: string }` format

**POST /upload**
- Request: FormData with file
- Response: `{ url: string, type: string, name: string, size: number }`

**POST /analyze**
- Request: `{ fileUrl: string, fileType: string }`
- Response: Analysis results as JSON

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### /api/chat
Handles chat messages and streaming responses from the backend.

```javascript
// Request
{
  message: "What's in this image?",
  conversationHistory: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." }
  ]
}

// Response (Server-Sent Events)
data: { content: "text chunk" }
data: { content: " more text" }
```

### /api/upload
Handles file uploads with unique filename generation.

```javascript
// Request
FormData {
  file: File
}

// Response
{
  url: "/uploads/abc123-filename.jpg",
  name: "filename.jpg",
  size: 1024000,
  type: "image/jpeg"
}
```

### /api/analyze
Analyzes uploaded media through the backend.

```javascript
// Request
{
  fileUrl: "/uploads/abc123-filename.jpg",
  fileType: "image/jpeg"
}

// Response
{
  analysis: "..."
}
```

## Component Overview

### ChatMessage
Displays individual messages with optional media attachments.
- Supports images, videos, audio, and PDF previews
- Timestamp display
- Glassmorphism styling with role-based colors

### ChatWindow
Scrollable container for all messages.
- Auto-scroll to latest message
- Empty state display
- Loading indicator with animation

### ChatInput
Text input with multi-line support and attachment display.
- Auto-expanding textarea
- Ctrl+Enter keyboard shortcut
- Attachment management
- Upload progress indication

### MediaUploader
Drag-and-drop file upload interface.
- Drag-and-drop support
- Click to browse
- Upload progress bar
- Error handling

### Header
Top navigation bar with chat controls.
- Branding and status
- Clear chat button
- Responsive layout

### Sidebar
Navigation sidebar for multiple conversations.
- Conversation list
- New chat creation
- Settings and help links
- Backend status display
- Mobile toggle support

## Hooks

### useChat
Manages chat state and message streaming.

```javascript
const { messages, isLoading, error, sendMessage, clearMessages } = useChat();

await sendMessage("Hello!", attachments);
clearMessages();
```

### useUpload
Manages file upload state and progress.

```javascript
const { upload, isUploading, uploadProgress, error } = useUpload();

const result = await upload(file);
// result = { url, type, name, size }
```

## Styling

The app uses Tailwind CSS with a custom dark theme:

- **Primary Color**: Blue gradient (`from-blue-500 to-blue-600`)
- **Background**: Dark slate (`slate-950` to `slate-900`)
- **Text**: Light slate (`slate-100` to `slate-300`)
- **Accents**: Semi-transparent overlays with backdrop blur

### Responsive Breakpoints

- **Mobile**: Single column layout with toggle sidebar
- **Tablet (md)**: Two-column layout with side-by-side view
- **Desktop (lg)**: Full three-column layout with visual separation

## Streaming Implementation

Messages stream using Server-Sent Events (SSE):

1. Frontend sends message to `/api/chat`
2. Route handler proxies to backend at `localhost:5000/chat`
3. Backend returns SSE stream
4. Frontend reads stream chunks and updates message in real-time
5. Message content accumulates as chunks arrive

```javascript
const response = await fetch('/api/chat', { method: 'POST' });
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse and display chunk
}
```

## File Upload Handling

Files are uploaded through Next.js route handlers:

1. Client uses XMLHttpRequest for progress tracking
2. Route handler saves file with random filename to `public/uploads/`
3. URL returned to client for display and API reference
4. Supports: images, videos, audio, PDF

## Deployment

### Vercel
One-click deployment with automatic environment variable setup:

```bash
vercel deploy
```

### Self-Hosted
1. Build the project: `pnpm build`
2. Start production server: `pnpm start`
3. Ensure backend is accessible
4. Configure environment variables if needed

## Environment Variables

Optional configuration:

```env
# Backend URL (defaults to localhost:5000)
NEXT_PUBLIC_API_URL=http://localhost:5000

# File upload settings
UPLOAD_MAX_SIZE=104857600  # 100MB
ALLOWED_FILE_TYPES=image/*,video/*,audio/*,.pdf
```

## Performance Optimizations

- **Code Splitting**: Components are lazy-loaded
- **Image Optimization**: Videos and audio use native HTML elements
- **CSS**: Tailwind with purge enabled
- **Streaming**: Real-time response display
- **Caching**: Browser cache for uploaded files

## Troubleshooting

### Backend Connection Error
- Ensure backend is running on `localhost:5000`
- Check CORS headers if backend is on different domain
- Verify network connectivity

### Upload Failures
- Check file size limits
- Verify file type is supported
- Ensure `public/uploads/` directory is writable

### Streaming Not Working
- Check SSE compatibility in browser
- Verify backend returns proper `Content-Type: text/event-stream`
- Look for CORS issues in browser console

### Messages Not Displaying
- Check browser console for errors
- Verify conversation history format
- Ensure message structure matches API contract

## Development

### Watch Mode
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

## Future Enhancements

- [ ] Multi-conversation management
- [ ] Voice input/output support
- [ ] Export chat history
- [ ] Theme customization
- [ ] Message editing and deletion
- [ ] User authentication
- [ ] Database persistence
- [ ] Image generation integration
- [ ] Rate limiting
- [ ] Analytics tracking

## License

MIT

## Support

For issues or feature requests, please open an issue in the repository.

---

**Built with ❤️ using v0**
