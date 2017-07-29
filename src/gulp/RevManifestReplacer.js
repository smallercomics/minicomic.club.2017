import path from 'path'
import through from 'through2'

export default (manifest) => {
    // can't use arrow function here because of the way 'this' is bound?
    var stream = through.obj(function(file, enc, cb){
        if (file.isBuffer()){
            const fileContents = file.contents.toString()
            const newFileContents = fileContents.replace(/url\(([a-zA-Z\/\.]*)\)/g, (match, captured)=>{
                const assetKey = path.basename(captured)
                const manifestName = manifest[assetKey]
                return `url(./${manifestName})`
            })
            file.contents = new Buffer(newFileContents)
        }
        this.push(file);
        cb();
    })
    return stream
}