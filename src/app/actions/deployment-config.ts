'use server'

import { supabase } from '@/lib/supabase'
import type { DeploymentConfig } from '@/types/deployment-config'

export async function createDeploymentConfig(
  containerId: string,
  // port: number,
  inputs: any[],
  outputs: any[]
) {
  try {
    const { data: deploymentData, error: deploymentError } = await supabase
      .from('deployments')
      .select()
      .eq('container_id', containerId)
      .single()


          console.log(`deploymentData:`, deploymentData)


    if (deploymentError) throw deploymentError

    const deploymentConfig: DeploymentConfig = {
      deployment_id: deploymentData.id,
      container_id: containerId,
      inputs,
      outputs,
      node_coordinates: { x: 0, y: 0 }, // Default coordinates
    }

    const { data, error } = await supabase
      .from('deployment_configs')
      .insert(deploymentConfig)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating deployment config:', error)
    return { success: false, error }
  }
}
