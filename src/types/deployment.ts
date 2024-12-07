import { DataType, InputConfig } from "@/components/ui/deploy-dialog"

export interface Deployment {
  id?: string
  container_id: string
  code: string
  url: string
  inputs?: InputConfig[]
  outputs?: DataType
  created_at?: string
}
