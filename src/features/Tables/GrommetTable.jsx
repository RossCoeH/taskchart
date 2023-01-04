import React from 'react';

import { Grommet, Box,TableHeader, TableRow, DataTable, Heading ,ColumnConfig,
ColumnSizeType,
TableCell,
Table} from 'grommet';
import { grommet, } from 'grommet/themes';

// interface Idata{
//   location:string,
//   date:string,
//   percent:number,
//   paid:number
// }

const DATA = [
  {
    location: 'Winston Salem',
    date: '2018-01-09',
    percent: 24,
    paid: 3425,
  },
  {
    location: 'Fort Collins',
    date: '2018-06-10',
    percent: 30,
    paid: 1234,
  },
  {
    location: 'Palo Alto',
    date: '2018-06-09',
    percent: 40,
    paid: 2345,
  },
  {
    location: 'Palo Alto',
    date: '2018-06-11',
    percent: 80,
    paid: 3456,
  },
  {
    location: 'Fort Collins',
    date: '2018-06-10',
    percent: 60,
    paid: 1234,
  },
  {
    location: 'Palo Alto',
    date: '2018-06-09',
    percent: 40,
    paid: 3456,
  },
  {
    location: 'Boise',
    date: '2018-06-11',
    percent: 50,
    paid: 1234,
  },
  {
    location: 'San Francisco',
    date: '2018-06-10',
    percent: 10,
    paid: 2345,
  },
];

const columnsData= [
  { property: 'location', header: 'Location', size: 'small',align: 'end'},
  { property: 'date', header: 'Date', size: 'small', align: 'end' },
  { property: 'percent', header: 'Percent', size: 'xsmall', align: 'end' },
  { property: 'paid', header: 'Paid', size: 'xsmall', align: 'end' },
];


function dtable(){
  return(
    
        <DataTable
          columns={columnsData}
          data={DATA}
          primaryKey={false}
          step={10}
          resizeable={true} />
  )
}

export const GrommetTable = () => {
  return (
    <Grommet theme={grommet}>
      <Heading level="3">Grommet Table with resizable & column sizes</Heading>
      <Box align="center" pad="large">
        <DataTable
          columns={columnsData}
          data={DATA}
          primaryKey={false}
          step={10}
          resizeable={true} />
      </Box>
    </Grommet>
  );
};
 //{title:"Grommet Table Data"}
GrommetTable.storyName = 'Resizable columns';

export default  GrommetTable