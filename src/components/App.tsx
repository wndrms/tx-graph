import { useEffect, useState } from "react";
import Graph from "./Graph";
import driver from './neo4j'
import Driver from "neo4j-driver/types/driver";

interface GraphData {
  nodes: { name: string }[],
  links: { source: string, target: string }[]
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
        var nodes: { name: string; }[] = []
        var links: { source: string; target: string; }[] = []
        try {
          const readQuery = 'MATCH (a:Wallet)-[t:TX]->(b:Wallet) WHERE a.hacker=$name OR b.hacker=$name RETURN a, t, b';
          const readResult = await session.executeRead(tx =>
            tx.run(readQuery, { name: target })
          );
          
          readResult.records.forEach(record => {
            if (nodes.find((node) => node.name === record.get('a').properties.addr) === undefined)
              nodes.push({ name: record.get('a').properties.addr })
            if (nodes.find((node) => node.name === record.get('b').properties.addr) === undefined)
              nodes.push({ name: record.get('b').properties.addr })
            if (links.find((link) => link.source === record.get('a').properties.addr && link.target === record.get('b').properties.addr) === undefined)
              links.push({ source: record.get('a').properties.addr, target: record.get('b').properties.addr })
            //console.log(record);
          });
        } catch (error) {
          console.error(`Something went wrong2: ${error}`);
        } finally {
          await session.close();
        }
        setData({ nodes, links });
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
