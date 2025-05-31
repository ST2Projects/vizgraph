import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { TEST } from "$env/static/private";
import testData from "./test.json";

async function loadJsonFiles() {
  const dataDir = "./data";
  let allData = {
    dependencies: [],
    artifacts: [],
    graphs: []
  };

  try {
    if (TEST !== undefined && TEST === "true") {
      console.log("Using test data")
      allData = testData;
    } else {
      console.log("Loading data from FS")
      const files = await readdir(dataDir);
      const jsonFiles = files.filter((file) => file.endsWith('.json'));

      for (const file of jsonFiles) {
        const filePath = join(dataDir, file);
        const fileContent = await readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Transform and merge dependencies
        const dependencies =
            data.dependencies?.map((d) => ({
              source: d.from,
              target: d.to
            })) || [];

        // Transform and merge artifacts
        const artifacts =
            data.artifacts?.map((d) => ({
              usedIn: data.graphName,
              id: d.id,
              groupId: d.groupId,
              artifactId: d.artifactId,
              version: d.version,
              scopes: d.scopes,
              types: d.types
            })) || [];

        // Add to combined data
        allData.dependencies.push(...dependencies);
        allData.artifacts.push(...artifacts);
        if (data.graphName) {
          allData.graphs.push(data.graphName);
        }
      }

      // Remove duplicate artifacts based on ID
      allData.artifacts = [...new Map(allData.artifacts.map((item) => [item.id, item])).values()];

      // Remove duplicate dependencies
      allData.dependencies = [
        ...new Map(
            allData.dependencies.map((item) => [`${item.source}-${item.target}`, item])
        ).values()
      ];

      // Remove duplicate graphs
      allData.graphs = [...new Set(allData.graphs)];
    }

    return allData;
  } catch (error) {
    console.error('Error loading JSON files:', error);
    throw error;
  }
}

export const GET = async ({ url }) => {
  try {
    const loadedData = await loadJsonFiles();
    return new Response(JSON.stringify(loadedData), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to load data',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
