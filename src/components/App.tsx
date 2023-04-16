import { useEffect, useState } from "react";
import Graph from "./Graph";
import driver from './neo4j'
import Driver from "neo4j-driver/types/driver";
import { Node, Link } from "./interfaces";

interface GraphData {
  nodes: Node[],
  links: Link[]
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
        var nodes: Node[] = [{name: target, layer: 0}]
        var links: Link[] = []
        try {
          const readQuery = 'MATCH (a:Wallet)-[t:TX]->(b:Wallet) WHERE a.hacker=$name OR b.hacker=$name RETURN a, t, b';
          const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { name: target })
          );
          
          readResult.records.forEach(record => {
            if (nodes.find((node) => node.name === record.get('a').properties.addr) === undefined)
              nodes.push({ name: record.get('a').properties.addr, type: record.get('a').properties.type })
            if (nodes.find((node) => node.name === record.get('b').properties.addr) === undefined)
              nodes.push({ name: record.get('b').properties.addr, type: record.get('b').properties.type })
            const link = links.find((link) => link.source === record.get('a').properties.addr && link.target === record.get('b').properties.addr) 
            if ( link === undefined ){
              links.push({ source: record.get('a').properties.addr, target: record.get('b').properties.addr, value: record.get('t').properties.value});
              console.log(record.get('a').properties.addr + ' ' + record.get('b').properties.addr + ' ' + record.get('t').properties.value);
            } else {
              link.value += record.get('t').value
            }
              
            //console.log(record);
          });
        } catch (error) {
          console.error(`Something went wrong2: ${error}`);
        } finally {
          await session.close();
        }
        var last_layer = setLayer(nodes, links, target);
        nodes.forEach((node) => {
          if (node.type === 'Contract') 
            node.layer = last_layer - 1;
          else if (node.type === 'Exchange')
            node.layer = last_layer;
        });
        setData({ nodes, links });
      }
      function setLayer(nodes:Node[], links: Link[], mainNode: string): number {
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
        return depth
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
