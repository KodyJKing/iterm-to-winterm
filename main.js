import './style.css'
import { XMLParser } from 'fast-xml-parser'

window.onload = function () {
    /** @type {HTMLInputElement} */
    const fileInput = document.getElementById( "fileInput" )

    fileInput.onchange = async function ( e ) {
        if ( fileInput.files )
            for ( let file of fileInput.files )
                onUpload( file )
    }
}

function parseXML( xml ) {
    const parser = new XMLParser()
    return parser.parse( xml )
}

/** @param {File} file  */
async function onUpload( file ) {
    let { name } = file
    name = name.match( /^(\w+)\.\w+$/ )[ 1 ]

    const itermXML = await file.text()
    const itermScheme = parseXML( itermXML )

    // Color mappings taken from: https://rakhesh.com/powershell/converting-iterm2-colours-to-windows-terminal-colors/
    const colorMapping = {
        "Ansi 0 Color": "black",
        "Ansi 1 Color": "red",
        "Ansi 2 Color": "green",
        "Ansi 3 Color": "yellow",
        "Ansi 4 Color": "blue",
        "Ansi 5 Color": "purple",
        "Ansi 6 Color": "cyan",
        "Ansi 7 Color": "white",
        "Ansi 8 Color": "brightBlack",
        "Ansi 9 Color": "brightRed",
        "Ansi 10 Color": "brightGreen",
        "Ansi 11 Color": "brightYellow",
        "Ansi 12 Color": "brightBlue",
        "Ansi 13 Color": "brightPurple",
        "Ansi 14 Color": "brightCyan",
        "Ansi 15 Color": "brightWhite",
        "Cursor Color": "cursorColor",
        "Selection Color": "selectionBackground",
        "Background Color": "background",
        "Foreground Color": "foreground",
    }

    function colorToHex( color ) {
        let [ a, b, g, r ] = color
        color = [ r, g, b ]
        return "#" + color.map( x => Math.floor( x * 255 ).toString( 16 ) ).join( "" ).toUpperCase()
    }

    const { key, dict } = itermScheme.plist.dict
    const winTermScheme = Object.fromEntries(
        key.map(
            ( key, index ) => [
                colorMapping[ key ],
                colorToHex( dict[ index ].real )
            ]
        ).filter(
            ( [ key, _color ] ) => key !== undefined
        ).concat( [ [ "name", name ] ] )
    )

    const output = document.getElementById( "output" )
    output.value = JSON.stringify( winTermScheme, null, 2 )
}

