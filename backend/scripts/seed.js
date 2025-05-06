// scripts/seed.js
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DB_PATH = path.join(__dirname, "../data/db.json");

// Ensure the data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Crear IDs fijos para facilitar las referencias
const samplePostId = "sample-post-1";
const user1Id = "1";
const user2Id = "2";
const user3Id = "3";
const user4Id = "4";
const user5Id = "5";

// Create initial data
const initialData = {
  posts: [
    {
      id: samplePostId,
      title: "Sample Blog Post",
      slug: "sample-post-1",
      content: `<p>This is a sample blog post content.</p>
                <p>You can add more paragraphs here to demonstrate the layout and styling of the blog detail page.</p>
                <h2>Key Features of This Blog System</h2>
                <ul>
                  <li>Responsive design that works on all devices</li>
                  <li>Support for comments and discussions</li>
                  <li>Category and tag organization</li>
                  <li>Author profiles and information</li>
                  <li>Related posts suggestions</li>
                </ul>
                <p>This is just a sample post to demonstrate the functionality of the blog system. In a real application, this would be replaced with actual content.</p>
                <h3>Code Example</h3>
                <pre><code>// Example Vue.js component
export default {
  data() {
    return {
      message: 'Hello World!'
    }
  },
  methods: {
    greet() {
      console.log(this.message)
    }
  }
}</code></pre>`,
      categoryId: "1",
      tags: ["sample", "example", "demo"],
      status: "published",
      featuredImage: "blog/posts/featured-image/sample-post-1.jpg",
      metaDescription:
        "This is a sample blog post to demonstrate the blog detail view.",
      authorId: user1Id,
      authorName: "John Doe",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 42,
    },
    {
      id: uuidv4(),
      title: "Getting Started with MEVN Stack",
      slug: "getting-started-with-mevn-stack",
      content: `<p>The MEVN stack is a free and open-source JavaScript software stack for building dynamic web sites and web applications. The MEVN stack is MongoDB, Express.js, Vue.js, and Node.js.</p>
                <h2>What is MEVN Stack?</h2>
                <p>MEVN Stack is a collection of JavaScript technologies used to develop web applications. From client to server to database, everything is based on JavaScript. MEVN is one of several variations of the MEAN stack (MongoDB, Express.js, AngularJS, Node.js), where the traditional AngularJS frontend framework is replaced with Vue.js.</p>
                <h2>Components of MEVN Stack</h2>
                <h3>MongoDB</h3>
                <p>MongoDB is a NoSQL database which stores data in JSON-like documents with dynamic schemas. It's designed to be scalable and developer-friendly.</p>
                <h3>Express.js</h3>
                <p>Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.</p>
                <h3>Vue.js</h3>
                <p>Vue.js is a progressive JavaScript framework used for building user interfaces. Unlike other monolithic frameworks, Vue is designed from the ground up to be incrementally adoptable.</p>
                <h3>Node.js</h3>
                <p>Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server side.</p>
                <h2>Why Choose MEVN Stack?</h2>
                <p>There are several benefits to using the MEVN stack:</p>
                <ul>
                  <li>JavaScript Everywhere: Use JavaScript for both client and server side</li>
                  <li>Single Page Applications: Create fluid and responsive SPAs</li>
                  <li>Open Source: All components are open-source with strong community support</li>
                  <li>Flexibility: Each component can be replaced if needed</li>
                  <li>Real-time Applications: Perfect for real-time applications like chat apps</li>
                </ul>`,
      categoryId: "1",
      tags: ["MEVN", "JavaScript", "Web Development", "Tutorial"],
      status: "published",
      featuredImage: "blog/posts/featured-image/mevn-stack.jpg",
      metaDescription:
        "Learn about the MEVN stack and how to get started with MongoDB, Express.js, Vue.js, and Node.js.",
      authorId: user1Id,
      authorName: "John Doe",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 254,
    },
    {
      id: uuidv4(),
      title: "Building RESTful APIs with Express.js",
      slug: "building-restful-apis-with-expressjs",
      content: `<p>Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. In this tutorial, we'll learn how to build RESTful APIs using Express.js.</p>
                <h2>What is a RESTful API?</h2>
                <p>REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP requests to perform CRUD (Create, Read, Update, Delete) operations.</p>
                <h2>Setting Up Express.js</h2>
                <p>First, let's set up a basic Express.js server:</p>
                <pre><code>const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});</code></pre>
                <h2>Creating API Routes</h2>
                <p>Now, let's create some basic CRUD routes:</p>
                <pre><code>// Get all items
app.get('/api/items', (req, res) => {
  // Logic to fetch all items
  res.json({ items: [] });
});

// Get a single item
app.get('/api/items/:id', (req, res) => {
  const id = req.params.id;
  // Logic to fetch item by id
  res.json({ item: {} });
});

// Create a new item
app.post('/api/items', (req, res) => {
  const newItem = req.body;
  // Logic to create item
  res.status(201).json({ item: newItem });
});

// Update an item
app.put('/api/items/:id', (req, res) => {
  const id = req.params.id;
  const updatedItem = req.body;
  // Logic to update item
  res.json({ item: updatedItem });
});

// Delete an item
app.delete('/api/items/:id', (req, res) => {
  const id = req.params.id;
  // Logic to delete item
  res.json({ message: 'Item deleted' });
});</code></pre>`,
      categoryId: "2",
      tags: ["Express.js", "Node.js", "API", "REST", "Backend"],
      status: "published",
      featuredImage: "https://via.placeholder.com/800x400?text=Express.js+APIs",
      metaDescription:
        "Learn how to build RESTful APIs with Express.js and Node.js. Complete guide with code examples.",
      authorId: "2",
      authorName: "Jane Smith",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 187,
    },
    {
      id: uuidv4(),
      title: "Vue.js Components and Props",
      slug: "vuejs-components-and-props",
      content: `<p>Components are one of the most powerful features of Vue.js. They help you extend basic HTML elements to encapsulate reusable code. In this post, we'll explore components and props in Vue.js.</p>
                <h2>What are Vue Components?</h2>
                <p>Components are reusable Vue instances with a name. They can be used as custom elements in the template of other Vue instances (components).</p>
                <h2>Creating a Component</h2>
                <p>Here's how to create a simple component:</p>
                <pre><code>Vue.component('button-counter', {
  data() {
    return {
      count: 0
    }
  },
  template: \`
    <button @click="count++">
      You clicked me {{ count }} times.
    </button>
  \`
})</code></pre>
                <p>In Vue 3 with the Composition API, you can create a component like this:</p>
                <pre><code><script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">
    You clicked me {{ count }} times.
  </button>
</template></code></pre>
                <h2>Using Props</h2>
                <p>Props are custom attributes you can register on a component. When a value is passed to a prop attribute, it becomes a property on that component instance.</p>
                <pre><code><script setup>
const props = defineProps({
  title: String,
  likes: Number,
  isPublished: Boolean,
  commentIds: Array,
  author: Object
})
</script>

<template>
  <h1>{{ title }}</h1>
  <p>{{ likes }} Likes</p>
</template></code></pre>
                <h2>Using the Component</h2>
                <p>Now you can use the component in your template:</p>
                <pre><code><blog-post 
  title="My journey with Vue"
  :likes="42"
  :is-published="true"
></blog-post></code></pre>`,
      categoryId: "3",
      tags: ["Vue.js", "JavaScript", "Frontend", "Components"],
      status: "published",
      featuredImage:
        "https://via.placeholder.com/800x400?text=Vue.js+Components",
      metaDescription:
        "Learn about Vue.js components and props. Understand how to create reusable components and pass data with props.",
      authorId: "1",
      authorName: "John Doe",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 321,
    },
  ],
  categories: [
    {
      id: "1",
      name: "Getting Started",
      slug: "getting-started",
      description: "Tutorials and guides for beginners",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Backend Development",
      slug: "backend-development",
      description: "Topics related to server-side development",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Frontend Development",
      slug: "frontend-development",
      description: "Everything about client-side development",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "DevOps",
      slug: "devops",
      description: "Deployment, CI/CD, and infrastructure",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Career",
      slug: "career",
      description: "Career advice and professional development",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  comments: [
    {
      id: uuidv4(),
      postId: samplePostId,
      content: "This is a great sample post! Looking forward to more content.",
      authorId: user3Id,
      authorName: "Michael Johnson",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: samplePostId,
      content:
        "I really like the layout and design of this blog. The comment system works great too!",
      authorId: user4Id,
      authorName: "Sarah Williams",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: samplePostId,
      content:
        "Thanks for sharing this example. It helped me understand how the blog system works.",
      authorId: user5Id,
      authorName: "David Brown",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: "1", // This should be updated with the actual post ID
      content: "Great article! I learned a lot about the MEVN stack.",
      authorId: "3",
      authorName: "Michael Johnson",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: "1", // This should be updated with the actual post ID
      content:
        "I've been using MEVN for my projects and it's been a great experience.",
      authorId: "4",
      authorName: "Sarah Williams",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: "2", // This should be updated with the actual post ID
      content:
        "Express.js makes building APIs so much easier. Thanks for the tutorial!",
      authorId: "5",
      authorName: "David Brown",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: "1", // Esto se actualizará con el ID real del post
      content: "Great article! I learned a lot about the MEVN stack.",
      authorId: user3Id,
      authorName: "Michael Johnson",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: "1", // Esto se actualizará con el ID real del post
      content:
        "I've been using MEVN for my projects and it's been a great experience.",
      authorId: user4Id,
      authorName: "Sarah Williams",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uuidv4(),
      postId: "2", // Esto se actualizará con el ID real del post
      content:
        "Express.js makes building APIs so much easier. Thanks for the tutorial!",
      authorId: user5Id,
      authorName: "David Brown",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  users: [
    {
      id: user1Id,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "hashed_password_here", // En una app real, esto estaría correctamente hasheado
      role: "admin",
      bio: "Full-stack developer with 5+ years of experience in MEVN stack.",
      avatar: "users/avatars/john-doe.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: user2Id,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      password: "hashed_password_here",
      role: "author",
      bio: "Backend developer specializing in Node.js and Express.",
      avatar: "users/avatars/jane-smith.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: user3Id,
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      password: "hashed_password_here",
      role: "user",
      bio: "Frontend enthusiast and UX designer.",
      avatar: "users/avatars/michael-johnson.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: user4Id,
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah.williams@example.com",
      password: "hashed_password_here",
      role: "user",
      bio: "DevOps engineer with a passion for automation.",
      avatar: "users/avatars/sarah-williams.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: user5Id,
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@example.com",
      password: "hashed_password_here",
      role: "user",
      bio: "Mobile developer and tech blogger.",
      avatar: "users/avatars/david-brown.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};
// Actualizar los IDs de los posts en los comentarios para los posts generados dinámicamente
// Los comentarios para sample-post-1 ya tienen el ID correcto
const mevnPostId = initialData.posts[1].id;
const expressPostId = initialData.posts[2] ? initialData.posts[2].id : null;

// Actualizar los IDs de los posts en los comentarios
if (mevnPostId) {
  initialData.comments[3].postId = mevnPostId;
  initialData.comments[4].postId = mevnPostId;
}

if (expressPostId) {
  initialData.comments[5].postId = expressPostId;
}

// Escribir datos en el archivo
fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");

// Asegurarse de que existan los directorios para las imágenes
const uploadsDir = path.join(__dirname, "../uploads");
const blogDir = path.join(uploadsDir, "blog/posts/featured-image");
const usersDir = path.join(uploadsDir, "users/avatars");

[uploadsDir, blogDir, usersDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log("Database seeded successfully!");

// Opcional: Crear archivos de imagen de muestra si no existen
const createPlaceholderImage = (filePath, text) => {
  if (!fs.existsSync(filePath)) {
    // Aquí podrías generar una imagen real o copiar una existente
    console.log(`Note: Placeholder image would be created at ${filePath}`);
  }
};

createPlaceholderImage(path.join(blogDir, "sample-post-1.jpg"), "Sample Post");
createPlaceholderImage(path.join(blogDir, "mevn-stack.jpg"), "MEVN Stack");
createPlaceholderImage(path.join(usersDir, "john-doe.jpg"), "John Doe");
createPlaceholderImage(path.join(usersDir, "jane-smith.jpg"), "Jane Smith");
createPlaceholderImage(
  path.join(usersDir, "michael-johnson.jpg"),
  "Michael Johnson"
);
createPlaceholderImage(
  path.join(usersDir, "sarah-williams.jpg"),
  "Sarah Williams"
);
createPlaceholderImage(path.join(usersDir, "david-brown.jpg"), "David Brown");
