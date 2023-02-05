import {toPlainText} from '@portabletext/toolkit'
import {definePlugin} from 'sanity'

import type {TableConfig, Cell} from './types'
import {createTableInput, TablePreview} from './components'

export * from './types'

export const portableTable = definePlugin<TableConfig>((schema) => {
  const portableTextSchema = schema.cellSchema

  const WrappedTableInput = createTableInput(portableTextSchema)

  return {
    name: 'portable-table',
    schema: {
      types: [
        {
          name: 'table-cell-body',
          type: 'array',
          of: [portableTextSchema],
        },
        {
          name: 'table-cell',
          type: 'object',
          preview: {
            select: {
              text: 'text',
            },
            prepare({text}) {
              return {title: toPlainText(text ?? [])}
            },
          },
          fields: [
            {
              name: 'text',
              type: 'table-cell-body',
            },
          ],
        },
        {
          name: 'table-row',
          type: 'object',
          preview: {
            select: {
              cells: 'cells',
            },
            prepare({cells = []}: {cells: Cell[]}) {
              return {title: cells.map((cell) => toPlainText(cell.text ?? [])).join(', ')}
            },
          },
          fields: [
            {
              name: 'cells',
              type: 'array',
              of: [
                {
                  type: 'table-cell',
                },
              ],
            },
          ],
        },
        {
          name: 'table',
          title: 'Dave Table',
          type: 'object',
          components: {
            preview: TablePreview,
            input: WrappedTableInput,
          },
          preview: {
            select: {
              rows: 'rows',
            },
            prepare({rows = []}) {
              return {rows}
            },
          },
          fields: [
            {
              name: 'num_cols',
              type: 'number',
              validation: (Rule) => Rule.required().min(1),
              initialValue: 3,
            },
            {
              name: 'rows',
              type: 'array',
              // TODO add a validation for column count
              of: [{type: 'table-row'}],
              initialValue: [],
            },
          ],
        },
      ],
    },
  }
})