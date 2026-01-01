# Use a lightweight nginx image
FROM nginx:alpine

# Copy the application files to the nginx public directory
COPY index.html /usr/share/nginx/html/
COPY scripts/ /usr/share/nginx/html/scripts/
COPY styles/ /usr/share/nginx/html/styles/

# Expose port 80
EXPOSE 80

# The default nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]
