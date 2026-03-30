// =============================================================================
// COMPONENTE EVENT FILTERS FORM - Module 4: Event Pass
// =============================================================================
// Formulario de filtros mejorado con interactividad.
//
// ## Client Component
// Lo hemos convertido a 'use client' para permitir:
// 1. Mantener la URL sincronizada sin recargas completas
// 2. Auto-submit al cambiar selectores (UX más fluida)
// 3. Búsqueda con debounce para escribir y filtrar automáticamente
// 4. Mostrar filtros activos visualmente
// =============================================================================

'use client';

import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  EVENT_CATEGORIES,
  CATEGORY_LABELS,
  EVENT_STATUSES,
  STATUS_LABELS,
  type EventCategory,
  type EventStatus,
} from '@/types/event';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface EventFiltersFormProps {
  currentFilters: {
    search?: string;
    category?: EventCategory;
    status?: EventStatus;
    priceMax?: number;
  };
}

/**
 * Formulario de filtros de eventos (Client Component).
 */
export function EventFiltersForm({ currentFilters }: EventFiltersFormProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado local para el input de búsqueda
  const [searchTerm, setSearchTerm] = useState(currentFilters.search ?? '');

  // Valor debounced (retrasado 500ms)
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sincronizamos el input si la URL cambia por navegación o reset
  useEffect(() => {
    setSearchTerm(currentFilters.search ?? '');
  }, [currentFilters.search]);

  const hasFilters = Boolean(
    currentFilters.search || currentFilters.category || currentFilters.priceMax || currentFilters.status
  );

  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string }> = [];

    if (currentFilters.search) {
      filters.push({ key: 'search', label: `Búsqueda: ${currentFilters.search}` });
    }

    if (currentFilters.category) {
      filters.push({ key: 'category', label: `Categoría: ${CATEGORY_LABELS[currentFilters.category]}` });
    }

    if (currentFilters.status) {
      filters.push({ key: 'status', label: `Estado: ${STATUS_LABELS[currentFilters.status]}` });
    }

    if (currentFilters.priceMax !== undefined) {
      filters.push({ key: 'priceMax', label: currentFilters.priceMax === 0 ? 'Precio: Gratis' : `Precio: Hasta $${currentFilters.priceMax}` });
    }

    return filters;
  }, [currentFilters]);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearSingleFilter = (key: string) => {
    updateFilters({ [key]: undefined });
  };

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  // Efecto para actualizar URL cuando cambia el texto debounced
  useEffect(() => {
    if (debouncedSearch === (currentFilters.search ?? '')) {
      return;
    }

    updateFilters({ search: debouncedSearch || undefined });
  }, [debouncedSearch, currentFilters.search]);

  // Handler para selectores
  const handleSelectChange = (key: 'category' | 'status' | 'priceMax') => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateFilters({ [key]: e.target.value || undefined });
    };
  };

  // Handler para input de búsqueda (actualiza estado local)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateFilters({ search: searchTerm || undefined });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Formulario con URL state */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Búsqueda */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </div>

        {/* Filtros adicionales */}
        <div className="flex flex-wrap gap-4">
          {/* Categoría */}
          <select
            name="category"
            value={currentFilters.category ?? ''}
            onChange={handleSelectChange('category')}
            className={`h-10 w-[180px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              currentFilters.category ? 'border-primary ring-1 ring-primary/20' : 'border-input'
            }`}
          >
            <option value="">Todas las categorías</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            name="status"
            value={currentFilters.status ?? ''}
            onChange={handleSelectChange('status')}
            className={`h-10 w-[180px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              currentFilters.status ? 'border-primary ring-1 ring-primary/20' : 'border-input'
            }`}
          >
            <option value="">Todos los estados</option>
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          {/* Precio maximo */}
          <select
            name="priceMax"
            value={currentFilters.priceMax?.toString() ?? ''}
            onChange={handleSelectChange('priceMax')}
            className={`h-10 w-[180px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              currentFilters.priceMax !== undefined ? 'border-primary ring-1 ring-primary/20' : 'border-input'
            }`}
          >
            <option value="">Cualquier precio</option>
            <option value="0">Gratis</option>
            <option value="25">Hasta $25</option>
            <option value="50">Hasta $50</option>
            <option value="100">Hasta $100</option>
            <option value="200">Hasta $200</option>
          </select>

          {/* Botón limpiar */}
          {hasFilters && (
            <Button type="button" variant="ghost" className="gap-2" onClick={clearAllFilters}>
              Clear all
            </Button>
          )}
        </div>
      </form>

      {/* Filtros activos */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-sm font-medium text-muted-foreground">Filtros activos:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span>{filter.label}</span>
              <button
                type="button"
                onClick={() => clearSingleFilter(filter.key)}
                className="rounded-full p-0.5 transition-colors hover:bg-black/10"
                aria-label={`Quitar filtro ${filter.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
