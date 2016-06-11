function Class1(v)
{
	var v1 = v;
	this.v2 = v;
	this.dump = function(){
		console.log(v1, this.v2)
	}
}


var a = new Class1("one")
var b = new Class1("two")

console.log(a)
console.log(b)
a.dump()
b.dump()

