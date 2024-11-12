import { useState } from "react"

type SandBoxProps = {
    setBirthDate: any
    birthDate: Date | undefined,
    age: number | null
}

const formPrettyDate = (date :Date) => {
    return date.getFullYear() + "/" + (date.getMonth()+1) +"/"+date.getDate();
};

// I bet this is a reinvention of wheel...
const formPrrettyDayOfWeek = (date :Date | null) =>{
    if (!date) {
        return "";
    }
    switch (date.getDay()) {
        case 0:
            return "SUN";
        case 1:
            return "MON";
        case 2:
            return "TUS";
        case 3:
            return "WED";
        case 4:
            return "THR";
        case 5:
            return "FRI"
        default:
            return "SAT";
    }
} 

const SandBoxForm = (props: SandBoxProps) => {
    const [birthDate, setBirthDate] = useState<Date>(new Date);
    const [age, setAge] = useState<number>();
    const [shownBirthDate, setShownBirthDate] = useState<Date>(); // redundant?

    const calculateAge = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(birthDate);
        conductCalculateAge(birthDate);
    }

    const conductCalculateAge = (birthDate: Date | null) => {

        if (birthDate == null) {
            return "";
        }

        const now = new Date();
        if (birthDate > now) {
            alert("future date designation");
            return "";
        }
        
        console.log({birthDate: formPrettyDate(birthDate)});

        const hasExperiencedBirthdayTheYear 
                = birthDate.getMonth() < now.getMonth()
                    || (birthDate.getMonth() === now.getMonth()
                    && birthDate.getDate() <= now.getDate());

        let age = now.getFullYear() - birthDate.getFullYear() -1;
        if (hasExperiencedBirthdayTheYear) {
                age++;
        }

        setAge(age);
        setBirthDate(birthDate);
        setShownBirthDate(birthDate);
        return age;
    }

    return (
    <>
        <div>
            <strong>-- Sand Box Area --</strong>
        </div>
        <form onSubmit={calculateAge}>
            <input type="Date" onChange={e => {if(e.target.valueAsDate) {setBirthDate(e.target.valueAsDate);} props.setBirthDate(e.target.valueAsDate);}} /><button type="submit" > do! </button>
        </form>

        <table>
            <thead>
                <tr>
                    <th>name</th>
                    <th>value</th>
                    <th>note</th>
                </tr>
            </thead>
            <tbody>
                <tr> 
                    <th>birth</th>
                    <th>{shownBirthDate? formPrettyDate(shownBirthDate):"xxxx/yy/zz"}</th> 
                    <th>{formPrrettyDayOfWeek(birthDate)}</th>
                </tr>
                <tr>
                    <th>age</th>
                    <th>{age || ""}</th>
                    <th>N/A</th>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={3}>&nbsp;</td>
                </tr>
            </tfoot>
        </table>
        
    </>
    )
};

// Following lines are Effective TypeScript Sandbox Area (no practical codes)
{   

    interface Vector2D {
        x: number;
        y: number;
    }

    // @ts-ignore
    interface NamedVector { // assignable to Vector2D
        name: string;
        x: number;
        y: number;
    }

    function calculateLength(v: Vector2D) {
        return Math.sqrt(v.x * v.x + v.y* v.y);
    }

    const namedVector = {name: "Jane", x: 1, y:2};
    // @ts-ignore
    const length = calculateLength(namedVector); // OK because namedVector objects are assignable to Vector2D

    // @ts-ignore
    interface Vector3D extends Vector2D{
        z: number;
    }    

    // Types are open, meaning TypeScript cannot catch problems using redundant or questionable propaerties 
    const vectorIn3D = {x: 0.5, y: 6, z: 7}
    // @ts-ignore
    const erroneouslength = calculateLength(vectorIn3D); // checks. TypeScript doesn't care higher dimension indicated by the additional property, z


    // To prevent inadvertent usage, we can use brand technique:
    interface BrandedVector2D {
        _brand: '2d';
        x: number;
        y: number;
    }

    function brandVector2D (v: Vector2D) : BrandedVector2D{
        return {x: v.x, y: v.y, _brand: '2d'}
    }

    function calculateLengthOfBrandedVector(v: BrandedVector2D){
        return Math.sqrt(v.y*v.x + v.y * v.y);
    }

    const vectorFoo = brandVector2D(namedVector);
    calculateLengthOfBrandedVector(vectorFoo); // OK
    // calculateLengthOfBrandedVector(vectorIn3D); // error
    // calculateLengthOfBrandedVector({x: 0.5, y: 6, z: 7, _brand:'3d'}); error 

    // @ts-ignore
    const maliciousVector = {x: 0.5, y: 6, z: 7, _brand:'2d'};
    //calculateLengthOfBrandedVector(maliciousVector); also error: _brand's type is string, not 2d literal
    
    // with intentional efforts, it can easily be breached, but at least inadvertent misuse will be well blocked with brands.
    

    type AbsolutePath = string & {_brand: 'abs'};
    // @ts-ignore
    type RelativePath = string & {_brand: 'rlt'};
    // @ts-ignore
    type Meters = number & {_brand: 'meters'};
    // @ts-ignore
    type Liters = number & {_brand: 'liters'};

    function isAbsolutePath(path: string): path is AbsolutePath  {
        return path.startsWith('/'); // does this work for Windows enviroments?
    }

    // @ts-ignore
    function getFile (path: AbsolutePath) {
        // do something
    }

    // getFile('my computer'); error

    // @ts-ignore
    function getFileIfAbsPath (path: string) {
        if (isAbsolutePath(path)) {
            getFile(path); // now path is AbsolutePath
        }
        // Dan notes that the behavior is nominal "type game", meaning string can't have propertie and the path object doesn't alter.
    }

    {
        class C {
            vals = [1,2,3];
            logSquares() {
                for (const val of this.vals) {
                    console.log(val * val);
                }
            }
        }

        const c = new C();
        c.logSquares(); // printing 1,4,9

        const anotherC = new C();
        const method = anotherC.logSquares;
        //method(); // runtime error! because this calling fails to bind the THIS;
        method.call(anotherC); // fine

        interface ButtunArgument {
            text: string,
            onClick: Function
        }

        // @ts-ignore
        function makeButton(obj: ButtunArgument) {
            // do something
        }
        // @ts-ignore
        class NaiveResetButton {
            onClick() {
                alert(`${this}`); // printing undefined...
            }
            render() {
                return makeButton({text: 'Reset', onClick: this.onClick});
            }
        }

        // @ts-ignore
        class SophisticatedResetButton {
            onClick() {
                alert(`${this}`); // same as the former one
            }
            render() {
                return makeButton({text: 'Reset', onClick: this.onClick}); // also same
            }
            constructor(){
                this.onClick = this.onClick.bind(this);
            }
        }
        // @ts-ignore
        class AnotherExpressionResetButton {
            render() {
                return makeButton({text: 'Reset', onClick: this.onClick});
            }
            onClick = () => { // arrow function expression generates a new function for each button!
                alert(`{$this}`); 
            }
        }
    }
    {
        function addKeyListener(
            el: HTMLElement,
            fn: (this: HTMLElement, e: KeyboardEvent) => void
        ) {
            el.addEventListener('keydown', e => {
                fn.call(el, e); // OK
                // fn(el,e); error. This is the special parameter
                // fn(e); the line just before is warned as we cannot give it two parameter, but of course just omit the this causes another error!
            });
        }

        //declare let el: HTMLElement; declare cannot exist in a component function
        // ref: https://stackoverflow.com/questions/73732791/modifiers-cannot-appear-here-ts1184-error-while-using-getstaticprops-in-nextjs
        if (0) { // this area cause runtime error, then suppress
            // @ts-ignore
            addKeyListener(el, function(e){
                // "this" is HTMLElement here!
                this.innerHTML;
            });
        }
        // @ts-ignore
        class Foo {
            registerHandler(el: HTMLElement) {
                addKeyListener(el,
                    // e => { this.innerHTML;} // with arrow function, the this doesn't remain!
                    // @ts-ignore
                    function(e){this.innerHTML}
                );
            }
        }
    }
};
declare let el: HTMLElement;

export default SandBoxForm;