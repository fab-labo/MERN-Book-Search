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
  // Log to check if the server is running
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.json()); // to parse JSON bodies
  app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies
  // Use Apollo Server's Express integration correctly with expressMiddleware
  app.use("/graphql", expressMiddleware(server, 
    { context: authMiddleware }
  )); // This integrates Apollo Server with Express

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  // Start the server once the database is connected
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/googlebooks")
    .then(() => {
      app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
        console.log(`GraphQL at http://localhost:${PORT}/graphql`);
      });
    })
    .catch((err) => console.error("MongoDB connection error:", err));
};

startApolloServer();
