import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import {Layout, Menu, Affix} from "antd";
import {PrivateRoute} from "../login/privateRoute";
import {isLoggedIn} from "../login/auth";
import {LoginView} from "../login/loginView";
import {MarkView} from "../mark/main";
import {DataManagerView} from "../dataManager/main";
import {ContributionView} from "../contribution/main";
import {NoMatch} from "./noMatch";
import './main.css'

const {Header, Content, Footer} = Layout;

const getCurrentLink = () => {
    let currentLink = 'login';
    if (isLoggedIn()) {
        currentLink = window.location.pathname.slice(1);
        const legalLinks = ['login', 'mark', 'manager', 'contribution'];
        if (legalLinks.indexOf(currentLink) < 0)
            currentLink = 'login';
    }
    return currentLink;
};

export class MainPanel extends Component {
    state = {
        currentLink: getCurrentLink(),
        userName: isLoggedIn() ? localStorage.username : '请先登录'
    };
    updateNavbar = () => this.setState({
        currentLink: getCurrentLink(),
        userName: isLoggedIn() ? localStorage.username : '请先登录'
    });

    render() {
        return (
            <Router>
                <Layout className="layout">
                    <Affix offsetTop={0}>
                        <Header>
                            <div className="welcome">欢迎您，{this.state.userName}！</div>
                            <Menu
                                theme="dark"
                                mode="horizontal"
                                selectedKeys={this.state.currentLink}
                                onSelect={this.updateNavbar}
                                style={{lineHeight: '64px'}}
                            >
                                <Menu.Item key="login"><Link to='/'>登录</Link></Menu.Item>
                                <Menu.Item key="mark"><Link to='/mark'>事件标注</Link></Menu.Item>
                                <Menu.Item key="manager"><Link to='/manager'>数据管理</Link></Menu.Item>
                                <Menu.Item key="contribution"><Link to='/contribution'>贡献排行</Link></Menu.Item>
                            </Menu>
                        </Header>
                    </Affix>
                    <Content style={{padding: '0 50px', marginTop: '100px'}}>
                        <Switch>
                            <PrivateRoute exact isloggedin={isLoggedIn()} path='/mark' component={MarkView}/>
                            <PrivateRoute exact isloggedin={isLoggedIn()} path='/manager' component={DataManagerView}/>
                            <PrivateRoute exact isloggedin={isLoggedIn()} path='/contribution'
                                          component={ContributionView}/>
                            <Route exact path='/'
                                   render={() => <LoginView updateNavbar={this.updateNavbar.bind(this)}/>}/>
                            <Route component={NoMatch}/>
                        </Switch>
                    </Content>
                    <Footer style={{textAlign: 'center'}}>
                    </Footer>
                </Layout>
            </Router>
        );
    }
}
