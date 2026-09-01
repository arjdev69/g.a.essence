import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Search, UserX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input } from '../../components/ui/Input'
import { LoadingState } from '../../components/ui/LoadingState'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table'
import type { ServiceDTO } from '../../domain/services/service.types'
import { serviceRepository } from '../../repositories/service.repository'
import { formatCurrencyBRL } from '../../utils/formatCurrencyBRL'
import { ServiceForm } from './ServiceForm'
import type { ServiceFormData } from './service.schema'

type ActiveFilter = 'all' | 'active' | 'inactive'
type ServiceFormMode = { type: 'create' } | { service: ServiceDTO; type: 'edit' }

type ServicesPageProps = {
  createRequest?: number
}

function getActiveFilterValue(activeFilter: ActiveFilter) {
  if (activeFilter === 'all') {
    return undefined
  }

  return activeFilter === 'active'
}

function formatPercentage(value: number) {
  return `${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}%`
}

function ServiceActions({
  isMutating,
  onDeactivate,
  onEdit,
  service,
}: {
  isMutating: boolean
  onDeactivate: (service: ServiceDTO) => void
  onEdit: (service: ServiceDTO) => void
  service: ServiceDTO
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        aria-label={`Editar ${service.name}`}
        className="min-h-11 min-w-11"
        disabled={isMutating}
        icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        onClick={() => onEdit(service)}
        size="icon"
        title="Editar"
        variant="ghost"
      />
      {service.active ? (
        <Button
          aria-label={`Inativar ${service.name}`}
          className="min-h-11 min-w-11"
          disabled={isMutating}
          icon={<UserX className="h-4 w-4" aria-hidden="true" />}
          onClick={() => onDeactivate(service)}
          size="icon"
          title="Inativar"
          variant="danger"
        />
      ) : null}
    </div>
  )
}

function ServiceStatusBadges({ service }: { service: ServiceDTO }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={service.active ? 'paid' : 'default'}>
        {service.active ? 'Ativo' : 'Inativo'}
      </Badge>
      {service.defaultValue === 0 ? <Badge variant="gift">Brinde</Badge> : null}
    </div>
  )
}

export function ServicesPage({ createRequest }: ServicesPageProps) {
  const queryClient = useQueryClient()
  const previousCreateRequestRef = useRef(createRequest)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const [formMode, setFormMode] = useState<ServiceFormMode | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | undefined>()
  const active = getActiveFilterValue(activeFilter)

  const {
    data: services = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['services', { active, search }],
    queryFn: () =>
      serviceRepository.list({
        active,
        search: search.trim() || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (input: ServiceFormData) => serviceRepository.create(input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services'] })
      setFeedbackMessage('Servico criado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ServiceFormData }) =>
      serviceRepository.update(id, input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services'] })
      setFeedbackMessage('Servico atualizado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => serviceRepository.deactivate(id),
    onError: () => {
      setFeedbackMessage('Nao foi possivel inativar o servico.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services'] })
      setFeedbackMessage('Servico inativado com sucesso.')
    },
  })

  useEffect(() => {
    if (
      createRequest !== undefined &&
      createRequest !== previousCreateRequestRef.current
    ) {
      setFormMode({ type: 'create' })
      setMutationError(undefined)
    }

    previousCreateRequestRef.current = createRequest
  }, [createRequest])

  function handleCloseForm() {
    setFormMode(null)
    setMutationError(undefined)
  }

  function handleEditService(service: ServiceDTO) {
    setFormMode({ service, type: 'edit' })
    setMutationError(undefined)
  }

  function handleDeactivateService(service: ServiceDTO) {
    const confirmed = window.confirm(`Inativar servico ${service.name}?`)

    if (!confirmed) {
      return
    }

    deactivateMutation.mutate(service.id)
  }

  async function handleSubmitService(input: ServiceFormData) {
    if (formMode?.type === 'edit') {
      await updateMutation.mutateAsync({ id: formMode.service.id, input })
      return
    }

    await createMutation.mutateAsync(input)
  }

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending
  const isMutating = isFormSubmitting || deactivateMutation.isPending

  return (
    <div className="space-y-4">
      {feedbackMessage ? (
        <Card className="border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            {feedbackMessage}
          </p>
        </Card>
      ) : null}

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <Input
            aria-label="Buscar servico por nome"
            className="min-h-11 pl-9 text-base sm:text-sm"
            name="serviceSearch"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar servico"
            type="search"
            value={search}
          />
        </div>
        <Select
          aria-label="Filtrar servicos por status"
          className="min-h-11 text-base sm:text-sm"
          name="activeFilter"
          onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
          options={[
            { label: 'Ativos', value: 'active' },
            { label: 'Inativos', value: 'inactive' },
            { label: 'Todos', value: 'all' },
          ]}
          value={activeFilter}
        />
      </section>

      {error ? (
        <ErrorState
          action={
            <Button className="min-h-11" onClick={() => void refetch()} variant="secondary">
              Tentar novamente
            </Button>
          }
          title="Nao foi possivel carregar os servicos."
        />
      ) : null}

      {isLoading ? (
        <LoadingState label="Carregando servicos..." variant="table" />
      ) : null}

      {!isLoading && !error && services.length === 0 ? (
        <EmptyState
          description="Ajuste a busca ou cadastre um novo servico."
          title="Nenhum servico encontrado."
        />
      ) : null}

      {!isLoading && !error && services.length > 0 ? (
        <>
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Duracao</TableHead>
                  <TableHead>Percentual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{formatCurrencyBRL(service.defaultValue)}</TableCell>
                    <TableCell>{service.durationMinutes} min</TableCell>
                    <TableCell>
                      {formatPercentage(service.clinicFeePercentage)}
                    </TableCell>
                    <TableCell>
                      <ServiceStatusBadges service={service} />
                    </TableCell>
                    <TableCell>
                      <ServiceActions
                        isMutating={isMutating}
                        onDeactivate={handleDeactivateService}
                        onEdit={handleEditService}
                        service={service}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {services.map((service) => (
              <Card className="p-4" key={service.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-zinc-950">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatCurrencyBRL(service.defaultValue)}
                    </p>
                  </div>
                  <ServiceStatusBadges service={service} />
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">Duracao</dt>
                    <dd className="mt-1 text-zinc-900">
                      {service.durationMinutes} min
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">
                      Percentual
                    </dt>
                    <dd className="mt-1 text-zinc-900">
                      {formatPercentage(service.clinicFeePercentage)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex justify-end">
                  <ServiceActions
                    isMutating={isMutating}
                    onDeactivate={handleDeactivateService}
                    onEdit={handleEditService}
                    service={service}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <Modal
        isOpen={Boolean(formMode)}
        onClose={handleCloseForm}
        title={formMode?.type === 'edit' ? 'Editar servico' : 'Novo servico'}
      >
        <ServiceForm
          defaultValues={
            formMode?.type === 'edit'
              ? {
                  active: formMode.service.active,
                  clinicFeePercentage: formMode.service.clinicFeePercentage,
                  defaultValue: formMode.service.defaultValue,
                  durationMinutes: formMode.service.durationMinutes,
                  name: formMode.service.name,
                }
              : undefined
          }
          errorMessage={mutationError}
          isSubmitting={isFormSubmitting}
          onCancel={handleCloseForm}
          onSubmit={handleSubmitService}
          submitLabel={
            formMode?.type === 'edit' ? 'Salvar alteracoes' : 'Criar servico'
          }
        />
      </Modal>
    </div>
  )
}
