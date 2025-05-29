# Composables de Orders View

Este directorio contiene los composables utilizados en el componente OrdersView. Cada composable está diseñado para manejar una funcionalidad específica y está acompañado de sus pruebas unitarias.

## Composables Disponibles

### useOrderFilters

Maneja la lógica de filtrado de órdenes.

**Características principales:**

- Filtrado por rango de fechas
- Filtrado por estado
- Filtrado por cliente nuevo
- Debounce en los cambios de filtros
- Opciones predefinidas para filtros comunes

### useOrderSort

Gestiona el ordenamiento de la tabla de órdenes.

**Características principales:**

- Ordenamiento ascendente/descendente
- Soporte para ordenamiento de números y strings
- Iconos dinámicos según el estado de ordenamiento
- Manejo de múltiples columnas

### useOrderSelection

Maneja la selección de órdenes en la tabla.

**Características principales:**

- Selección individual y múltiple
- Selección de página actual
- Selección de todas las páginas
- Estado indeterminado para selección parcial
- Deselección por página o global

### useOrderAnimations

Proporciona animaciones y transiciones para la interfaz.

**Características principales:**

- Transiciones suaves para cambios de estado
- Animaciones para filas de tabla
- Transiciones para filtros
- Animaciones de estado con colores
- Duración personalizable

### useOrderActions

Maneja las acciones de usuario con retroalimentación visual.

**Características principales:**

- Exportación de órdenes
- Importación de órdenes
- Actualización de lista
- Cambio de estado de órdenes
- Mensajes de retroalimentación
- Indicadores de carga

## Uso

```javascript
// Ejemplo de uso de los composables
import { useOrderFilters } from "./composables/useOrderFilters";
import { useOrderSort } from "./composables/useOrderSort";
import { useOrderSelection } from "./composables/useOrderSelection";
import { useOrderAnimations } from "./composables/useOrderAnimations";
import { useOrderActions } from "./composables/useOrderActions";

export default {
  setup() {
    const filters = useOrderFilters();
    const sort = useOrderSort();
    const selection = useOrderSelection();
    const animations = useOrderAnimations();
    const actions = useOrderActions();

    return {
      ...filters,
      ...sort,
      ...selection,
      ...animations,
      ...actions,
    };
  },
};
```

## Pruebas

Cada composable tiene su conjunto de pruebas unitarias en el directorio `__tests__`. Para ejecutar las pruebas:

```bash
npm run test
```

## Mantenimiento

Al modificar o agregar funcionalidades:

1. Mantener la separación de responsabilidades
2. Actualizar las pruebas unitarias correspondientes
3. Documentar los cambios en este README
4. Seguir las convenciones de nombres establecidas
5. Mantener la coherencia en el manejo de estados
