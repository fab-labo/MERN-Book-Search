const { ApolloServer } = require("@apollo/server"); // Use ApolloServer from @apollo/server
const express = require("express");
const mongoose = require("mongoose");
const { typeDefs, resolvers } = require("./schema/index.js");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const { expressMiddleware } = require("@apollo/server/express4"); // Correct middleware import

const PORT = process.env.PORT || 3001;
const app = express();

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  try {
    await server.start();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Apollo Server Middleware
    app.use("/graphql", expressMiddleware(server, { context: authMiddleware }));

    // Serve static frontend files in production
    if (process.env.NODE_ENV === "production") {
      console.log("Running in production mode... serving frontend");
      app.use(express.static(path.join(__dirname, "../client/dist")));

      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
      });
    } else {
      console.log("Running in development mode...");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/googlebooks");
    console.log("✅ Connected to MongoDB");

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 GraphQL available at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
  }
};

startApolloServer();
