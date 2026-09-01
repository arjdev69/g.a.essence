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
import type { ProfessionalDTO } from '../../domain/professionals/professional.types'
import { professionalRepository } from '../../repositories/professional.repository'
import { ProfessionalForm } from './ProfessionalForm'
import type { ProfessionalFormData } from './professional.schema'

type ActiveFilter = 'all' | 'active' | 'inactive'
type ProfessionalFormMode =
  | { type: 'create' }
  | { professional: ProfessionalDTO; type: 'edit' }

type ProfessionalsPageProps = {
  createRequest?: number
}

function getActiveFilterValue(activeFilter: ActiveFilter) {
  if (activeFilter === 'all') {
    return undefined
  }

  return activeFilter === 'active'
}

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : '-'
}

function formatPercentage(value: number) {
  return `${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}%`
}

function ProfessionalActions({
  isMutating,
  onDeactivate,
  onEdit,
  professional,
}: {
  isMutating: boolean
  onDeactivate: (professional: ProfessionalDTO) => void
  onEdit: (professional: ProfessionalDTO) => void
  professional: ProfessionalDTO
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        aria-label={`Editar ${professional.name}`}
        className="min-h-11 min-w-11"
        disabled={isMutating}
        icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        onClick={() => onEdit(professional)}
        size="icon"
        title="Editar"
        variant="ghost"
      />
      {professional.active ? (
        <Button
          aria-label={`Inativar ${professional.name}`}
          className="min-h-11 min-w-11"
          disabled={isMutating}
          icon={<UserX className="h-4 w-4" aria-hidden="true" />}
          onClick={() => onDeactivate(professional)}
          size="icon"
          title="Inativar"
          variant="danger"
        />
      ) : null}
    </div>
  )
}

function ProfessionalStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'paid' : 'default'}>
      {active ? 'Ativo' : 'Inativo'}
    </Badge>
  )
}

export function ProfessionalsPage({ createRequest }: ProfessionalsPageProps) {
  const queryClient = useQueryClient()
  const previousCreateRequestRef = useRef(createRequest)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const [formMode, setFormMode] = useState<ProfessionalFormMode | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | undefined>()
  const active = getActiveFilterValue(activeFilter)

  const {
    data: professionals = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ['professionals', { active, search }],
    queryFn: () =>
      professionalRepository.list({
        active,
        search: search.trim() || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (input: ProfessionalFormData) =>
      professionalRepository.create(input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['professionals'] })
      setFeedbackMessage('Profissional criado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProfessionalFormData }) =>
      professionalRepository.update(id, input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['professionals'] })
      setFeedbackMessage('Profissional atualizado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => professionalRepository.deactivate(id),
    onError: () => {
      setFeedbackMessage('Nao foi possivel inativar o profissional.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['professionals'] })
      setFeedbackMessage('Profissional inativado com sucesso.')
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

  function handleEditProfessional(professional: ProfessionalDTO) {
    setFormMode({ professional, type: 'edit' })
    setMutationError(undefined)
  }

  function handleDeactivateProfessional(professional: ProfessionalDTO) {
    const confirmed = window.confirm(`Inativar profissional ${professional.name}?`)

    if (!confirmed) {
      return
    }

    deactivateMutation.mutate(professional.id)
  }

  async function handleSubmitProfessional(input: ProfessionalFormData) {
    if (formMode?.type === 'edit') {
      await updateMutation.mutateAsync({ id: formMode.professional.id, input })
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
            aria-label="Buscar profissional por nome"
            className="min-h-11 pl-9 text-base sm:text-sm"
            name="professionalSearch"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar profissional"
            type="search"
            value={search}
          />
        </div>
        <Select
          aria-label="Filtrar profissionais por status"
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
        <ErrorState title="Nao foi possivel carregar os profissionais." />
      ) : null}

      {isLoading ? (
        <LoadingState label="Carregando profissionais..." variant="table" />
      ) : null}

      {!isLoading && !error && professionals.length === 0 ? (
        <EmptyState
          description="Ajuste a busca ou cadastre um novo profissional."
          title="Nenhum profissional encontrado."
        />
      ) : null}

      {!isLoading && !error && professionals.length > 0 ? (
        <>
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>PIX</TableHead>
                  <TableHead>Percentual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">
                      {professional.name}
                    </TableCell>
                    <TableCell>
                      {formatNullable(professional.specialty)}
                    </TableCell>
                    <TableCell>{formatNullable(professional.phone)}</TableCell>
                    <TableCell>{formatNullable(professional.pixKey)}</TableCell>
                    <TableCell>
                      {formatPercentage(professional.defaultClinicFeePercentage)}
                    </TableCell>
                    <TableCell>
                      <ProfessionalStatusBadge active={professional.active} />
                    </TableCell>
                    <TableCell>
                      <ProfessionalActions
                        isMutating={isMutating}
                        onDeactivate={handleDeactivateProfessional}
                        onEdit={handleEditProfessional}
                        professional={professional}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {professionals.map((professional) => (
              <Card className="p-4" key={professional.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-zinc-950">
                      {professional.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatNullable(professional.specialty)}
                    </p>
                  </div>
                  <ProfessionalStatusBadge active={professional.active} />
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">Telefone</dt>
                    <dd className="mt-1 text-zinc-900">
                      {formatNullable(professional.phone)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">PIX</dt>
                    <dd className="mt-1 truncate text-zinc-900">
                      {formatNullable(professional.pixKey)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">
                      Percentual
                    </dt>
                    <dd className="mt-1 text-zinc-900">
                      {formatPercentage(
                        professional.defaultClinicFeePercentage,
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex justify-end">
                  <ProfessionalActions
                    isMutating={isMutating}
                    onDeactivate={handleDeactivateProfessional}
                    onEdit={handleEditProfessional}
                    professional={professional}
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
        title={
          formMode?.type === 'edit' ? 'Editar profissional' : 'Novo profissional'
        }
      >
        <ProfessionalForm
          defaultValues={
            formMode?.type === 'edit'
              ? {
                  active: formMode.professional.active,
                  defaultClinicFeePercentage:
                    formMode.professional.defaultClinicFeePercentage,
                  name: formMode.professional.name,
                  phone: formMode.professional.phone,
                  pixKey: formMode.professional.pixKey,
                  specialty: formMode.professional.specialty,
                }
              : undefined
          }
          errorMessage={mutationError}
          isSubmitting={isFormSubmitting}
          onCancel={handleCloseForm}
          onSubmit={handleSubmitProfessional}
          submitLabel={
            formMode?.type === 'edit'
              ? 'Salvar alteracoes'
              : 'Criar profissional'
          }
        />
      </Modal>
    </div>
  )
}
