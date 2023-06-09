import React from 'react';
import * as echarts from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption } from 'echarts';
import { Link, Node } from "./interfaces";
import { TplFormatterParam } from 'echarts/types/src/util/format';

// Register necessary components
echarts.use([
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface GraphProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
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
        node.zlevel = 10;
        if(layer === 99) {
          node.x = 0;
          node.y = 0;
        } else {
          node.y = centerX - index * 2 * nodeRadius;
          node.x = layer * 2000;
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
          triggerOn: 'none',
          formatter: function (params:TplFormatterParam) {
            return `Node: ${params.name}`
          }
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
            symbolSize: 20,
            roam: true,
            label: {
              show: false,
            },
            draggable: true,
            data: data.nodes,
            links: data.links,
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [2, 5],
            edgeLabel: {
              show: true,
              position: 'insideMiddle',
              formatter: '{@value}',
            },
          },
        ],
      };
      chart.setOption(options);
      chart.on('click', (params) => {
        if (params.componentType === 'series') {
          if (params.dataType === 'node') {
            const nodeIndex:number = params.dataIndex;
            console.log(data.nodes[nodeIndex])
          }
          
        }
      });
    }
  }, [data]);

  return <div ref={chartRef} style={{ height: '500px' }} />;
};

export default Graph;