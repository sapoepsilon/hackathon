-- Create the trigger function for updating timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the deployment_configs table
CREATE TABLE deployment_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  inputs JSONB NOT NULL DEFAULT '[]',
  outputs JSONB NOT NULL DEFAULT '[]',
  node_coordinates JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on deployment_id for faster lookups
CREATE INDEX deployment_configs_deployment_id_idx ON deployment_configs(deployment_id);

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON deployment_configs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
