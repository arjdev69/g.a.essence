import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Pencil, Search, UserX } from 'lucide-react'
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
import { patientRepository } from '../../repositories/patient.repository'
import type { PatientDTO } from '../../domain/patients/patient.types'
import { PatientForm } from './PatientForm'
import type { PatientFormData } from './patient.schema'

type ActiveFilter = 'all' | 'active' | 'inactive'
type PatientFormMode = { type: 'create' } | { patient: PatientDTO; type: 'edit' }

type PatientsPageProps = {
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

function PatientActions({
  isMutating,
  onDeactivate,
  onEdit,
  patient,
}: {
  isMutating: boolean
  onDeactivate: (patient: PatientDTO) => void
  onEdit: (patient: PatientDTO) => void
  patient: PatientDTO
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        aria-label={`Editar ${patient.name}`}
        disabled={isMutating}
        icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        onClick={() => onEdit(patient)}
        size="icon"
        title="Editar"
        variant="ghost"
      />
      <Button
        aria-label={`Historico de ${patient.name}`}
        disabled
        icon={<Clock className="h-4 w-4" aria-hidden="true" />}
        size="icon"
        title="Historico"
        variant="ghost"
      />
      {patient.active ? (
        <Button
          aria-label={`Inativar ${patient.name}`}
          disabled={isMutating}
          icon={<UserX className="h-4 w-4" aria-hidden="true" />}
          onClick={() => onDeactivate(patient)}
          size="icon"
          title="Inativar"
          variant="danger"
        />
      ) : null}
    </div>
  )
}

function PatientStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'paid' : 'default'}>
      {active ? 'Ativo' : 'Inativo'}
    </Badge>
  )
}

export function PatientsPage({ createRequest }: PatientsPageProps) {
  const queryClient = useQueryClient()
  const previousCreateRequestRef = useRef(createRequest)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const [formMode, setFormMode] = useState<PatientFormMode | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | undefined>()
  const active = getActiveFilterValue(activeFilter)

  const {
    data: patients = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ['patients', { active, search }],
    queryFn: () =>
      patientRepository.list({
        active,
        search: search.trim() || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (input: PatientFormData) => patientRepository.create(input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      setFeedbackMessage('Paciente criado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatientFormData }) =>
      patientRepository.update(id, input),
    onError: () => {
      setMutationError('Nao foi possivel salvar. Tente novamente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      setFeedbackMessage('Paciente atualizado com sucesso.')
      setFormMode(null)
      setMutationError(undefined)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => patientRepository.deactivate(id),
    onError: () => {
      setFeedbackMessage('Nao foi possivel inativar o paciente.')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      setFeedbackMessage('Paciente inativado com sucesso.')
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

  function handleEditPatient(patient: PatientDTO) {
    setFormMode({ patient, type: 'edit' })
    setMutationError(undefined)
  }

  function handleDeactivatePatient(patient: PatientDTO) {
    const confirmed = window.confirm(`Inativar paciente ${patient.name}?`)

    if (!confirmed) {
      return
    }

    deactivateMutation.mutate(patient.id)
  }

  async function handleSubmitPatient(input: PatientFormData) {
    if (formMode?.type === 'edit') {
      await updateMutation.mutateAsync({ id: formMode.patient.id, input })
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
            aria-label="Buscar paciente por nome"
            className="pl-9"
            name="patientSearch"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar paciente"
            type="search"
            value={search}
          />
        </div>
        <Select
          aria-label="Filtrar pacientes por status"
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
        <ErrorState title="Nao foi possivel carregar os pacientes." />
      ) : null}

      {isLoading ? (
        <LoadingState label="Carregando pacientes..." variant="table" />
      ) : null}

      {!isLoading && !error && patients.length === 0 ? (
        <EmptyState
          description="Ajuste a busca ou cadastre um novo paciente."
          title="Nenhum paciente encontrado."
        />
      ) : null}

      {!isLoading && !error && patients.length > 0 ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{formatNullable(patient.phone)}</TableCell>
                    <TableCell>
                      <PatientStatusBadge active={patient.active} />
                    </TableCell>
                    <TableCell>
                      <PatientActions
                        isMutating={isMutating}
                        onDeactivate={handleDeactivatePatient}
                        onEdit={handleEditPatient}
                        patient={patient}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {patients.map((patient) => (
              <Card className="p-4" key={patient.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-zinc-950">
                      {patient.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatNullable(patient.phone)}
                    </p>
                  </div>
                  <PatientStatusBadge active={patient.active} />
                </div>
                <div className="mt-3 flex justify-end">
                  <PatientActions
                    isMutating={isMutating}
                    onDeactivate={handleDeactivatePatient}
                    onEdit={handleEditPatient}
                    patient={patient}
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
        title={formMode?.type === 'edit' ? 'Editar paciente' : 'Novo paciente'}
      >
        <PatientForm
          defaultValues={
            formMode?.type === 'edit'
              ? {
                  active: formMode.patient.active,
                  birthDate: formMode.patient.birthDate,
                  name: formMode.patient.name,
                  notes: formMode.patient.notes,
                  phone: formMode.patient.phone,
                }
              : undefined
          }
          errorMessage={mutationError}
          isSubmitting={isFormSubmitting}
          onCancel={handleCloseForm}
          onSubmit={handleSubmitPatient}
          submitLabel={
            formMode?.type === 'edit' ? 'Salvar alteracoes' : 'Criar paciente'
          }
        />
      </Modal>
    </div>
  )
}
