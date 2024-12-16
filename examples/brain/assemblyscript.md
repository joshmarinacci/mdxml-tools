# AssemblyScript Brain

While AS (Assembly Script) looks a lot like TS (TypeScript), it’s not. It has a lot of limitations. It is limited in specific way to make sure

Hello, I am trying to dictate right now.

Well assembly script looks a lot like type script. It is not there's a lot of limitations. These limitations are created specifically to make sure that the code can compile down tightly something that can be optimized on embedded computers and doesn't have any well. JavaScript isms connected to this means unfortunately that certain features like JavaScript API's may not be available that is expected of course there's no Dom here, but it also means that we can't do things like union types. AS does not have true closures, I think, but it can handle arrow functions for arrays as long as the functions don’t capture anything from the environment (which would make them closures).

# loop over every element in an array

```typescript
let cells = new Array<Cell>();
let has_germ = cells.some((cell:Cell) => cell.germ==true)

```

# class parameter shorthand

Create an class with a constructor. All parametesr must be have types. AS generally cannot infer your types. even return types must be declared

``` typescript
class Cell {
    empty:boolean;
    color:i32;
    attached:i32;
    constructor( color:i32, attached:i32) {
        this.empty = true
        this.color = color
        this.attached = attached
    }
	static makeCell():Cell {
		return new Cell(0,5)
	}
```


class constructor with property initialization shorthands

this
```typescript
class Point {
    x:i32
    y:i32
    constructor(x:i32, y:i32) {
        this.x = x
        this.y = y
    }
}
```

can be shortend to

```typescript
class Point {
    constructor(public x:i32, public y:i32) {
}

```

Integers and floats are different types, unlike JS where they are both just Numbers.  Generally use i32 for integers and f32 for floats.

Arrays are like JS arrays, you can pre-allocate them or create new ones and push new elements at the end. Arrays can have types. Arrays should not have nulls in them if the type is nothing not nullable.

ex:
```typescript
var arr = new Array<string>(10)
// arr[0]; // would error 😢
for (let i = 0; i < arr.length; ++i) {
  arr[i] = ""
}
arr[0]; // now it works 😊
```




# convert PNG to sprite data

``` shell
w4 png2src --assemblyscript bunny.png
```

The PNG must have only 4 colors in it. Use subrect to draw