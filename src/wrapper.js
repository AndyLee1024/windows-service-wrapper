const fss = require('fs-extra');
const fs = require('fs');
const path = require('path-extra');

class Wrapper
{
    constructor() {
        this.nssmPath = path.datadir('nssm');
        this.installPath = path.resolve(this.nssmPath, 'nssm.exe');
    }

    install() {
        let exeOrigin = path.join(__dirname, '..', 'bin', 'nssm', 'nssm.exe');
        let exeData = fs.readFileSync(exeOrigin, {encoding: 'binary'})
        fss.ensureDir(this.nssmPath).then(()=>{
            fs.writeFileSync(path.join(this.nssmPath, 'nssm.exe'), exeData, {encoding: 'binary'})
        }).catch(err => {

        })
    }

    executable(){
        fs.access(this.installPath, fs.constants.X_OK, (err) => {
            if (err) {
                this.install();
            }
        });
        return this.installPath;
    }
}

module.exports = Wrapper;
