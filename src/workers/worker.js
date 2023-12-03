const chokidar = require('chokidar');
const path = require('path');

const { ingestCustomerData, ingestLoanData } = require('./utils/dataIngestion');

const excelFilesPath = path.join(__dirname, '..', '..', 'data');

function watchForChanges() {
    const watcher = chokidar.watch(excelFilesPath, {
        ignored: /(^|[\/\\])\../, // ignore hidden files
        persistent: true,
    });

    watcher
        .on('add', filePath => {
            console.log(`File ${filePath} has been added. Running data ingestion task...`);

            if (filePath.includes('customer_data.xlsx')) {
                ingestCustomerData(filePath);
            } else if (filePath.includes('loan_data.xlsx')) {
                ingestLoanData(filePath);
            }
        })
        .on('change', filePath => {
            console.log(`File ${filePath} has been changed. Running data ingestion task...`);

            if (filePath.includes('customer_data.xlsx')) {
                ingestCustomerData(filePath);
            } else if (filePath.includes('loan_data.xlsx')) {
                ingestLoanData(filePath);
            }
        });
}

module.exports = { watchForChanges };
