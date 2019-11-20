import React, {Component} from 'react';
import {Button, Dropdown, Menu, Icon, Input, Row, Col} from "antd";
import './loginView.css'
import {getUserName} from "./auth";
import {Link} from "react-router-dom";

export class LoginView extends Component {
    state = {
        name: getUserName()
    };
    handleMenuClick = (e) => {
        localStorage.setItem('username', this.state.name);
        this.props.updateNavbar();
        // if (e.key === 'mapping')
        //     window.location.replace('/mapping');
        // else
        //     window.location.replace('/standardModify');
    };
    onChange = (e) => {
        const name = e.target.value;
        this.setState({
            name: name
        })
    };

    render() {
        return (
            <div id='login'>
                <Row type='flex' justify='center' align='middle' gutter={48}>>
                    <Col span={6}>
                        <h1>请先登录</h1>
                    </Col>
                    <Col span={3}>
                        <Input placeholder='请输入姓名' onChange={this.onChange} value={this.state.name}/>
                        <Button type='default' onClick={this.handleMenuClick}><Link to='/mark'>登录</Link></Button>
                    </Col>
                </Row>
            </div>
        )
    }
}