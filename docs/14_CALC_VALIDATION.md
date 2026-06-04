# 14 - Validacao de calculos com planilha real

Data: 2026-06-04

Task: TASK-060 - Conferir calculos com a planilha real.

## Status

Concluido.

A planilha real foi recebida em:

```txt
C:/Users/ARJ/Downloads/Relatorio Pacientes.xlsx.zip
```

O arquivo `.zip` contem abas exportadas como HTML. As abas com colunas de
divisao financeira foram usadas para a validacao:

- `2026 - FEV.html`
- `2026 - MAR.html`
- `2026 - ABRIL.html`
- `Maio.html`

As abas `Pacientes ...` foram inspecionadas, mas nao entram nesta conferencia de
divisao financeira porque nao possuem as colunas `GANHO` e `30% CLINICA`.

## Regra conferida

Formula do app:

```txt
clinicFeeValue = value * clinicFeePercentage / 100
professionalGainValue = value - clinicFeeValue
```

Para a planilha, foi conferido o percentual de 30%:

```txt
clinica = valor * 30%
ganho = valor - clinica
```

Brindes com valor `R$ 0,00` foram tratados como:

```txt
clinica = 0
ganho = 0
```

## Resultado por aba

| Aba | Linhas conferidas | Brindes | Total valor | Total clinica | Total ganho | Divergencias |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `2026 - FEV.html` | 2 | 0 | 220,00 | 66,00 | 154,00 | 0 |
| `2026 - MAR.html` | 12 | 2 | 1.684,00 | 505,20 | 1.178,80 | 0 |
| `2026 - ABRIL.html` | 15 | 8 | 820,00 | 246,00 | 574,00 | 0 |
| `Maio.html` | 12 | 8 | 490,00 | 147,00 | 343,00 | 0 |

## Resultado geral

| Campo | Valor |
| --- | ---: |
| Linhas conferidas | 41 |
| Brindes | 18 |
| Total valor | 3.214,00 |
| Total clinica | 964,20 |
| Total ganho profissional | 2.249,80 |
| Divergencias encontradas | 0 |

## Amostras conferidas

| Valor | Clinica na planilha | Ganho na planilha | Resultado |
| ---: | ---: | ---: | --- |
| 160,00 | 48,00 | 112,00 | aprovado |
| 110,00 | 33,00 | 77,00 | aprovado |
| 594,00 | 178,20 | 415,80 | aprovado |
| 0,00 | 0,00 | 0,00 | aprovado |

## Observacoes

- A planilha separa o cabecalho em `GANHO` e `30% CLINICA`; para a validacao,
  esses campos foram interpretados como ganho profissional e taxa da clinica.
- Algumas linhas de brinde tinham celulas vazias na coluna da clinica; como o
  valor era `R$ 0,00`, foram normalizadas para `0`, igual a regra do app.
- Nenhuma divergencia de arredondamento foi encontrada.

## Validacao executada

- `npm run test`: aprovado, 13 testes.
- `npm run lint`: aprovado.
- `npm run build`: aprovado, com avisos conhecidos de `module.register()` e
  chunk acima de 500 kB.
