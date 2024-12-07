FROM node:18-alpine
WORKDIR /app
COPY index.js .
ENV INPUT_CONFIG="[object Object],[object Object],[object Object]"
ENV OUTPUT_CONFIG="string"
EXPOSE 7238
CMD ["node", "index.js"]