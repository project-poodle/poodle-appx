//const React = lib.react
import React from 'react'
const { forwardRef } = React
// import { forwardRef } from 'react'

// const { Helmet } = lib['react-helmet']
import { Helmet } from 'react-helmet'
// const PropTypes = lib['prop-types']
import PropTypes from 'prop-types'

const Page = forwardRef(({
  children,
  title = '',
  ...rest
}, ref) => {
  return (
    <div
      ref={ref}
      {...rest}
    >
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {children}
    </div>
  );
});

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string
};

export default Page;
