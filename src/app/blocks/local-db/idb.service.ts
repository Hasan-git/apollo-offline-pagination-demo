import * as JsStore from 'jsstore';
import * as workerPath from 'file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.min.js';
import { IDataBase, DATA_TYPE, ITable } from 'jsstore';

// This will ensure that we are using only one instance.
// Otherwise due to multiple instance multiple worker will be created.
export const idbCon = new JsStore.Instance(new Worker(workerPath));
export const dbname = 'apollo-pagination-Demo';




const getDatabase = () => {
  const tblPatient: ITable = {
    name: 'Patients',
    columns: {
      id: {
        primaryKey: true,
        dataType: DATA_TYPE.String
      },
      name: {
        dataType: DATA_TYPE.String,
      },
      contact: {
        dataType: DATA_TYPE.String,
      },
      email: {
        dataType: DATA_TYPE.String
      }
    }
  };
  const dataBase: IDataBase = {
    name: dbname,
    tables: [tblPatient]
  };
  return dataBase;
};

export const initJsStore = () => {
  const dataBase = getDatabase();
  idbCon.initDb(dataBase);
};
