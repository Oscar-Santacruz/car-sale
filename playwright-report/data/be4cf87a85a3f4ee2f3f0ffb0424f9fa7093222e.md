# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Bienvenido" [level=3] [ref=e5]
      - paragraph [ref=e6]: Ingresa tus credenciales para acceder
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: Correo Electrónico
        - textbox "Correo Electrónico" [ref=e10]:
          - /placeholder: usuario@ejemplo.com
          - text: admin@test.com
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: Contraseña
          - link "¿Olvidaste tu contraseña?" [ref=e14] [cursor=pointer]:
            - /url: /forgot-password
        - generic [ref=e15]:
          - textbox "Contraseña" [ref=e16]: test123
          - button [ref=e17]:
            - img [ref=e18]
      - generic [ref=e21]: Invalid login credentials
      - button "Iniciar Sesión" [ref=e22]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e28] [cursor=pointer]:
    - img [ref=e29]
  - alert [ref=e32]
```