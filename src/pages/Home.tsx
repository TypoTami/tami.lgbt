import tami from '../assets/portait.jpg'

export function Home() {
    return (
        <>
            <div id="container">
                <div className="item tamiCard">
                    <div id="tamiProfile">
                        <img src={tami} id="tamiPic"/>
                        <p id="name">Tami Butcher</p>
                        {/*<p id="pronouns">she/they/fae</p>*/}
                    </div>
                </div>

                <div className="item" id="blurb">
                    <p>Hi! Welcome to my site! I am a soon-to-be Computer Scientist! :)</p>
                    <p>Currently, I am studying in my final year of B.Sc. Computer Science, which thereafter I will be
                        moving into doing an integrated M.Eng.</p>
                    <p>There is not much here at the moment as I am currently working on this site. But here there shall
                        be some fun projects published here.</p>
                </div>
            </div>
        </>
    )
}