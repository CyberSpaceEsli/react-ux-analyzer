// Test file for Loading Detection - Mixed examples (good and bad practices)

import React, { useState, useEffect } from 'react';

// Mock components - simple implementations
const Spinner = () => <div className="spinner">Loading...</div>;
const ProgressBar = ({ value, max }) => <div>Progress: {value}/{max}</div>;

// Mock API functions
const fetchUser = (id) => Promise.resolve({ id, name: 'John Doe' });
const submitForm = (data) => Promise.resolve({ success: true });

// ✅ GOOD EXAMPLE: Component with proper loading state
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Good: Set loading state before async operation
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  // Good: Show loading indicator to user
  if (loading) {
    return <Spinner />;
  }

  return <div>{user?.name}</div>;
}

// ✅ GOOD EXAMPLE: Form with submission feedback  
function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Good: Show loading state during submission
    setSubmitting(true);
    try {
      await submitForm({ email });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* Good: Button shows loading state and is disabled */}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

// ✅ GOOD EXAMPLE: Progress indicator
function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        setUploadProgress(0);
      }
    }, 200);
  };

  return (
    <div>
      {/* Good: Visual progress feedback */}
      {uploading && <ProgressBar value={uploadProgress} max={100} />}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

// ✅ GOOD EXAMPLE: Skeleton loading
function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPosts([{ id: 1, title: 'Post 1' }]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div>
      {loading ? (
        // Good: Skeleton placeholder
        <div className="skeleton shimmer" style={{height: '60px'}} />
      ) : (
        posts.map(post => <div key={post.id}>{post.title}</div>)
      )}
    </div>
  );
}

// ❌ BAD EXAMPLE: No loading feedback
function BadUserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Bad: No loading state - user doesn't know it's loading
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}

// ❌ BAD EXAMPLE: Form without loading state
function BadContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Bad: No loading feedback - user might click multiple times
    submitForm({ email: 'test@example.com' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" />
      {/* Bad: No loading state */}
      <button type="submit">Submit</button>
    </form>
  );
}

export { 
  UserProfile, 
  ContactForm, 
  FileUpload, 
  PostList, 
  BadUserProfile, 
  BadContactForm 
};