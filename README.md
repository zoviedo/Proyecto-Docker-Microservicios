<div align="center">

# Plataforma Web Dinámica para Microservicios

[![Python](https://img.shields.io/badge/Python-%233776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/) 
[![Flask](https://img.shields.io/badge/Flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/) 
[![Docker](https://img.shields.io/badge/Docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/) 
[![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/) 
[![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/) 
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) 
[![Shadcn/ui](https://img.shields.io/badge/Shadcn_ui-%23FFB500.svg?style=for-the-badge)](https://shadcn-ui.com/) 
[![Traefik](https://img.shields.io/badge/Traefik-%23009CFF.svg?style=for-the-badge&logo=traefik&logoColor=white)](https://traefik.io/) 
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)


Plataforma web completa para crear, desplegar, ejecutar y gestionar microservicios en contenedores Docker, con integración a Roble.

[Características](#-características) • [Arquitectura](#%EF%B8%8F-arquitectura) • [Tecnologías](#%EF%B8%8F-arquitectura) • [Requisitos Previos](#-requisitos-previos) • [Instalación y Configuración](#-instalación-y-configuración) • [Uso](#-uso) • [Ejemplos](#-ejemplos) • [Demostración](#-demostración) • [Licencia](#-licencia)


</div>

## 🚀 Características
- **Dashboard de Gestión:** Interfaz web interactiva para crear, listar, editar y eliminar microservicios dinámicamente.

- **Editor de Código Integrado:** Permite a los usuarios escribir y modificar funciones directamente en el navegador, con soporte para plantillas de Python con y sin Roble.

- **Panel de Pruebas:** Facilita invocar los endpoints de los microservicios, enviar parámetros JSON y visualizar respuestas en tiempo real.

- **Despliegue Dinámico de Contenedores:** Cada microservicio se empaqueta y ejecuta en un contenedor Docker independiente, garantizando aislamiento y escalabilidad.

- **Integración con Roble:** Microservicios preparados para conectarse de manera segura a la API de Roble con token de acceso y project ID.

- **Motor de Ejecución Flexible:** Capacidad de invocar funciones de usuario con cero, uno o dos argumentos, adaptándose a diferentes firmas de función.

- **Gestión de Ciclo de Vida de Microservicios:** Soporta operaciones CRUD completas, incluyendo reinicio y eliminación de contenedores dinámicos.

- **Interfaz Responsiva y Moderna:** Construida con Next.js y Shadcn/ui, con soporte para control de estado de microservicios y edición en tiempo real.

## 🏗️ Arquitectura

## 🛠️ Tecnologías
- **Python:** Lenguaje principal para el backend y la creación de microservicios.
- **Flask:** Framework para construir el backend gestor y los microservicios dinámicos.
- **Docker:** Contenerización de cada microservicio para aislamiento e independencia.
- **Next.js:** Frontend interactivo donde los usuarios escriben código, gestionan microservicios y prueban endpoints.
- **Traefik:** Proxy inverso que enruta las solicitudes de manera dinámica a cada microservicio según su URL.

## 📌 Requisitos Previos
Antes de ejecutar la plataforma, asegúrate de tener instaladas las siguientes herramientas:
- **Docker** (versión >= 7.1.0)  
  [Instalación oficial de Docker](https://www.docker.com/get-started)
- **Docker Compose**  
  [Instalación oficial de Docker Compose](https://docs.docker.com/compose/install/)
- **Python** (versión >= 3.10 recomendada)  
  [Instalación oficial de Python](https://www.python.org/downloads/)
- **Flask** (versión 3.0.3)  
  ```bash
  pip install Flask==3.0.3
  ```
- **docker SDK para Python** (versión 7.1.0)
  ```bash
  pip install docker==7.1.0
  ```
- **Navegador web moderno** (Chrome, Edge, Firefox) para acceder al dashboard.
> [!TIP]
> Se recomienda usar un entorno virtual de Python (venv) para instalar Flask y el SDK de Docker y evitar conflictos con otras versiones del sistema.

## 💾 Instalación y Configuración
Sigue estos pasos para desplegar la plataforma completa en tu máquina:
### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/zoviedo/proyecto-docker-microservicios.git
cd proyecto-docker-microservicios
````

### 2️⃣ Construir y levantar los servicios con Docker Compose

```bash
docker-compose up --build
```

Este comando construye todas las imágenes de Docker y levanta los contenedores necesarios.
Incluye:
  * Backend Gestor (Python/Flask)
  * Frontend (Next.js)
  * Reverse Proxy (Traefik)

### 3️⃣ Acceso a la plataforma

- Abre tu navegador y accede a la plataforma en:  
  [http://localhost:8000](http://localhost:8000)

- Desde este puerto se pueden utilizar **todas las funcionalidades** de la plataforma:
  - Crear, editar y eliminar microservicios.
  - Editar código de los microservicios.
  - Probar microservicios a través del panel de pruebas.

- Cada microservicio desplegado tendrá su endpoint disponible en:  
  `http://localhost:8000/<nombre-del-microservicio>`  

> [!IMPORTANT]
> - Los comandos de Docker Compose levantan **todos los servicios automáticamente**.
> - La configuración de Roble (token y project ID) se gestiona desde el frontend al crear o probar microservicios.
> - Mantener Docker y Docker Compose actualizados evita errores de compatibilidad.


## 📋 Uso

La plataforma cuenta con tres apartados principales: **Editor**, **Microservicios** y **Pruebas**.

### 1️⃣ Editor
- Aquí es donde puedes **crear un nuevo microservicio**.
- **Pasos para usarlo:**
  1. Ingresa el **nombre del microservicio**.
  2. Activa o desactiva la opción **“Microservicio de Roble”** según corresponda.
     - Si está activado, el microservicio podrá interactuar con la API de Roble.
     - Si está desactivado, funcionará de manera independiente.
  3. Escribe tu **código de microservicio** en el editor.
  4. Haz clic en **“Desplegar Microservicio”**.
- Una vez desplegado, el microservicio queda activo y se puede gestionar desde el apartado **Microservicios**.
<p align="center">
<img width="800" height="auto" alt="image" src="https://github.com/user-attachments/assets/45344f58-0fd6-4eda-b64e-4904a40d601c" />
</p>

### 2️⃣ Microservicios
- Lista todos los microservicios que existen actualmente en la plataforma.
- Para cada microservicio puedes:
  - **Eliminar**: Borra el contenedor y libera recursos.
  - **Parar**: Detiene la ejecución del contenedor.
  - **Reiniciar**: Reinicia el contenedor.
  - **Editar**: Permite cambiar:
    - El nombre del microservicio.
    - Si es de Roble o no.
    - El código del microservicio.
<p align="center">
<img width="800" height="auto" alt="image" src="https://github.com/user-attachments/assets/54f5992c-b29c-4ba9-bab1-35f9a36c374f" />
</p>

### 3️⃣ Pruebas
- Permite **invocar los endpoints** de los microservicios y visualizar la respuesta en formato JSON.
- **Microservicios sin Roble:**
  - Selecciona el microservicio.
  - Ingresa los parámetros en JSON si es necesario.
  - Haz clic en **“Enviar Prueba”**.
  - Obtendrás la respuesta en JSON.
- **Microservicios con Roble:**
  - Selecciona el microservicio.
  - Ingresa el **Identificador del Proyecto** y el **Token de Acceso**.
  - Ingresa los parámetros en JSON si es necesario.
  - Haz clic en **“Enviar Prueba”**.
  - La respuesta se mostrará en formato JSON.
<p align="center">
<img width="800" height="auto" alt="image" src="https://github.com/user-attachments/assets/d6125a6a-b509-4680-b12a-df2ff89152ce" />
</p>

> 💡 Todos los microservicios tienen su endpoint disponible en:  
> `http://localhost:8000/<nombre-del-microservicio>`  
> Por ejemplo: `http://localhost:8000/filtro-estudiantes`

## 🧩 Ejemplos
A continuación se muestran tres ejemplos de microservicios que puedes copiar y pegar en el editor de la plataforma para probar su funcionamiento.
### 1️⃣ Hola Mundo
**Tipo:** No Roble
```python
def hola_mundo():
  return "¡La plataforma funciona!"
```
<p align="center">
<img width="800" height="auto" alt="image" src="https://github.com/user-attachments/assets/b9acf323-f4e5-4965-b6be-b2b09adbc287" />
</p>

### 2️⃣ Suma de dos valores
**Tipo:** No Roble
```python
def sumar_desde_json(payload):
  a = payload.get('a', 0)
  b = payload.get('b', 0)

  if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
    raise TypeError("Los parámetros 'a' y 'b' deben ser números.")

  resultado = a + b
  return { "resultado": resultado }
```
<p align="center">
<img width="800" height="auto" alt="image" src="https://github.com/user-attachments/assets/88e84d92-0fde-40a0-b6dc-735df44bdc56" />
</p>


### 3️⃣ Leer tabla en Roble
**Tipo:** Roble
```python
def leer_registros(client, payload):
  if not payload.get('tableName'):
    raise ValueError("El 'payload' debe incluir 'tableName'.")

  url = f"{client.db_url}/read"

  response = client.session.get(url, params=payload)
  response.raise_for_status()

  return response.json()
```
<p align="center">
<img width="800" height="auto" alt="image" src="https://github.com/user-attachments/assets/07c7b15d-749d-49ed-84bb-2b6029c78caf" />
</p>

## 🎬 Demostración

A continuación se muestra un video que ilustra el funcionamiento de la plataforma:

<p align="center">
  <a href="https://www.youtube.com/watch?v=274usIr2gas" target="_blank">
    <img width="800" alt="Demo Plataforma" src="https://img.youtube.com/vi/274usIr2gas/0.jpg" />
  </a>
</p>

> Haz clic en la imagen para ver el video completo de la demostración.
> 
## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.  
Esto significa que puedes usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software, siempre y cuando incluyas el aviso de copyright original y la licencia en todas las copias o partes sustanciales del software.

Para más detalles, consulta la licencia completa aquí:  
[MIT License](https://opensource.org/licenses/MIT)
