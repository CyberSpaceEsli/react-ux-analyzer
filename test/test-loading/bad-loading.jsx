// Test file for Loading Detection - Bad practices only

import React, { useState, useEffect } from 'react';

// Mock functions
const fetchUserData = () => Promise.resolve({ name: 'John', email: 'john@example.com', posts: [] });
const submitContact = (data) => Promise.resolve({ success: true });
const searchAPI = (query) => Promise.resolve([{ id: 1, title: 'Result 1' }]);

// ❌ BAD EXAMPLE: No loading feedback during data fetch
function BadUserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Bad: Async operation without loading indication
    fetch(`/api/users/${userId}`)
      .then(response => response.json())
      .then(setUser);
      
    // Bad: Another async call without feedback
    fetchUserData().then(data => setPosts(data.posts || []));
  }, [userId]);

  return (
    <div>
      <h1>{user?.name}</h1>
      <div>{posts.map(post => <div key={post.id}>{post.title}</div>)}</div>
    </div>
  );
}

// ❌ BAD EXAMPLE: Form submission without feedback
function BadContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Bad: Async submission without loading state
    await submitContact({ email, message });
    alert('Message sent!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {/* Bad: No loading state during submission */}
      <button type="submit">Send Message</button>
    </form>
  );
}

// ❌ BAD EXAMPLE: Search without loading indication
function BadSearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      // Bad: Search without loading feedback
      searchAPI(query).then(setResults);
    }
  }, [query]);

  return (
    <div>
      {results.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
}

// ❌ BAD EXAMPLE: File upload without progress
function BadFileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Bad: Upload without progress indication
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    alert('File uploaded!');
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      {/* Bad: No upload progress */}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

// ❌ BAD EXAMPLE: Login without loading state
function BadLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Bad: Authentication without loading feedback
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="text" 
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {/* Bad: No loading state during authentication */}
      <button type="submit">Login</button>
    </form>
  );
}

export { 
  BadUserDashboard, 
  BadContactForm, 
  BadSearchResults, 
  BadFileUploader, 
  BadLoginForm 
};