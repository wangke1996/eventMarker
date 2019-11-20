import React, {Component} from 'react';
import {Card} from "antd";
import Img404 from '../img/404.jpg'

const {Meta} = Card;

export class NoMatch extends Component {
    render() {
        return (
            <div>
                <Card className='noMatchCard' style={{width: 500}}
                      cover={<a href='#'><img onClick={() => window.location.replace('/')} alt='404 Not Found'
                                              src={Img404}/></a>}>
                    <Meta title={<span className='title'>喵喵喵？？小可爱迷路了吧？点本喵送你回主页(✪ω✪)</span>}/>
                </Card>
            </div>
        )
    }
}