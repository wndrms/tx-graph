import { useEffect, useState } from "react";
import Graph from "./Graph";
import driver from './neo4j'
import Driver from "neo4j-driver/types/driver";

interface GraphData {
  nodes: Node[],
  links: Link[]
}
interface Node {
  name: string,
  layer: number,
  y: number,
}

interface Link {
  source: string,
  target: string,
}

function App() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  useEffect(() => {
    (async () => {
      try{
        const target = '0x098b716b8aaf21512996dc57eb0615e2383e2f96'
        await findNodes(driver, target)
      } catch (error) {
        console.error(`Something went wrong1: ${error}`);
      } finally {
        await driver.close();
      }

      async function findNodes(driver: Driver, target: string) {
        const session = driver.session({ database: 'neo4j' });
        var nodes: { name: string; layer: number, y: number}[] = [{name: target, layer: 0, y: 0}]
        var links: { source: string; target: string; }[] = []
        try {
          const readQuery = 'MATCH (a:Wallet)-[t:TX]->(b:Wallet) WHERE a.hacker=$name OR b.hacker=$name RETURN a, t, b';
          const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { name: target })
          );
          
          readResult.records.forEach(record => {
            if (nodes.find((node) => node.name === record.get('a').properties.addr) === undefined)
              nodes.push({ name: record.get('a').properties.addr, layer: 99, y: 0 })
            if (nodes.find((node) => node.name === record.get('b').properties.addr) === undefined)
              nodes.push({ name: record.get('b').properties.addr, layer: 99, y: 0 })
            if (links.find((link) => link.source === record.get('a').properties.addr && link.target === record.get('b').properties.addr) === undefined)
              links.push({ source: record.get('a').properties.addr, target: record.get('b').properties.addr })
            //console.log(record);
          });
        } catch (error) {
          console.error(`Something went wrong2: ${error}`);
        } finally {
          await session.close();
        }
        setLayer(nodes, links, target);
        nodes.forEach((node) => {
          node.y = node.layer * 50;
        });
        setData({ nodes, links });
        console.log(nodes)
      }
      function setLayer(nodes:Node[], links: Link[], mainNode: string): void {
        const queue: string[] = [mainNode];
        const visited: {[key: string]: boolean} = {[mainNode]: true};
        let depth = 1;
        while(queue.length > 0) {
          const n = queue.length;
          for(let i = 0; i < n; i++) {
            const currNode = queue.shift()!;
            const neighbors = getNeighbors(currNode, links);
            for (const neighbor of neighbors) {
              if(!visited[neighbor]) {
                const node = nodes.find((node) => node.name === neighbor)!;
                node.layer = depth;
                visited[neighbor] = true;
                queue.push(neighbor);
              }
            }
          }
          depth++;
        }
      }
      function getNeighbors(node: string, links: Link[]): string[] {
        const neighbors: string[] = [];
        links.forEach((link) => {
          if (link.source === node) {
            neighbors.push(link.target);
          }
        })
        return neighbors
      }

    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Graph data={data} />
      </header>
    </div>
  );
}

export default App;
