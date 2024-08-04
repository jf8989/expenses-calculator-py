# Gestor de Gastos Compartidos

## Descripción
Esta aplicación web permite a los usuarios gestionar y dividir gastos compartidos entre múltiples participantes. Facilita el ingreso de transacciones, la asignación de gastos a diferentes personas y el cálculo automático de los totales por participante.

## Características
- Gestión dinámica de participantes
- Ingreso y análisis de transacciones
- Asignación flexible de gastos a múltiples participantes
- Cálculo automático de totales por participante
- Interfaz de usuario intuitiva y responsive

## Tecnologías Utilizadas
- Backend: Python con Flask
- Frontend: HTML, CSS, JavaScript
- Almacenamiento: JSON (para simplicidad, puede ser expandido a una base de datos)

## Configuración del Proyecto
1. Clona el repositorio:
   ```
   git clone [URL del repositorio]
   ```
2. Navega al directorio del proyecto:
   ```
   cd gestor-gastos-compartidos
   ```
3. Crea un entorno virtual:
   ```
   python -m venv venv
   ```
4. Activa el entorno virtual:
   - En Windows: `venv\Scripts\activate`
   - En macOS y Linux: `source venv/bin/activate`
5. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```

## Ejecución de la Aplicación
1. Asegúrate de que el entorno virtual esté activado.
2. Ejecuta la aplicación Flask:
   ```
   python app.py
   ```
3. Abre un navegador y ve a `http://localhost:5000`

## Uso
1. Añade participantes en la sección "Gestión de Participantes".
2. Ingresa las transacciones en el formato especificado en la sección "Ingreso de Transacciones".
3. Haz clic en "Analizar Transacciones" para procesar las entradas.
4. Asigna las transacciones a los participantes correspondientes.
5. Revisa el resumen de gastos actualizado automáticamente.

## Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de crear un pull request.

## Licencia
[Incluir información de licencia aquí]