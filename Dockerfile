# Usa una imagen base de Node.js más ligera y segura
FROM node:20-slim

# Instala tzdata para configurar zona horaria
RUN apt-get update && apt-get install -y tzdata

# Configura la zona horaria
ENV TZ=America/Lima

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia package.json y package-lock.json primero para aprovechar el caché de Docker
COPY package*.json ./

# Instala las dependencias de producción de forma limpia y eficiente
RUN npm ci --only=production

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que la aplicación correrá DENTRO del contenedor
EXPOSE 3000

# Define el comando para iniciar la aplicación
CMD ["node", "index.js"]
