Instrucciones para ejecutar la aplicación


Requisitos previos
Node.js y npm: Asegúrate de tener Node.js y npm instalados.
Git: Si deseas clonar el repositorio, instala Git.


Clonar el repositorio
git clone https://github.com/GeraEsc/Act-4
cd Act-4


Instalar dependencias
npm install


Variables de entorno
Crea un archivo .env en la raíz del proyecto con las siguientes variables
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mi-base-de-datos
JWT_SECRET=tu-secreto


Ejecutar la aplicación
npm start
La aplicación se ejecutará en http://localhost:3000.


Ejecutar pruebas
npm test


Despliegue en Vercel
Instala Vercel si no lo tienes:
npm install -g vercel


Despliega la aplicación:
npx vercel --prod --token=tu-token-de-vercel
