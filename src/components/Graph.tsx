import React from 'react';
import * as echarts from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption } from 'echarts';

// Register necessary components
echarts.use([
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  GridComponent,
]);

interface GraphProps {
  data: {
    nodes: Array<{ name: string; layer: number }>;
    links: Array<{ source: string; target: string }>;
  };
}
interface Node {
  name: string,
  layer: number,
  x: number,
  y: number,
}

interface Link {
  source: string,
  target: string,
}

const Graph: React.FC<GraphProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    
    const layerGroups = new Map();
    data.nodes.forEach(node => {
      const layer = node.layer;
      if (!layerGroups.has(layer)) {
        layerGroups.set(layer, []);
      }
      layerGroups.get(layer).push(node);
    });
    layerGroups.forEach((nodes, layer) => {
      const totlaNodes = nodes.length;
      const nodeRadius = 50;
      const centerX = (totlaNodes - 1) * nodeRadius;
      nodes.forEach((node: Node, index: number) => {
        if(layer === 99) {
          node.x = 0;
          node.y = 0;
        } else {
          node.y = centerX - index * 2 * nodeRadius;
          node.x = layer * 200;
        }
      });
    });
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const options: EChartsOption = {
        title: {
          text: 'Money Laundering',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: true,
        },
        series: [
          {
            type: 'graph',
            layout: 'none',
            force: {
              layoutAnimation: false,
              edgeLength: 120,
            },
            symbolSize: 10,
            roam: true,
            label: {
              show: false,
            },
            draggable: true,
            data: data.nodes,
            links: data.links,
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [2, 5],
          },
        ],
      };
      chart.setOption(options);
    }
  }, [data]);

  return <div ref={chartRef} style={{ height: '500px' }} />;
};

export default Graph;