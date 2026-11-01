# Image unique pour l'API et le worker ; le serveur exécute le TypeScript via tsx
FROM node:22-alpine
# Extraction des PDF (pdftotext, pdfinfo, pdftoppm) et OCR des PDF scannés en français et anglais
RUN apk add --no-cache poppler-utils tesseract-ocr tesseract-ocr-data-fra tesseract-ocr-data-eng font-dejavu
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
RUN mkdir -p /data && chown node:node /data
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3184 DATA_DIR=/data
USER node
EXPOSE 3184
CMD ["sh", "-c", "npx tsx server/migrate.ts && npx tsx server/index.ts"]
