import Header from "@/components/Header";
import { GetStaticPaths, GetStaticProps } from "next";
import { sanityClient, urlFor } from "../../sanity";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form"
import { useState } from 'react';

function Post({post}) {

    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, formState: {errors} } = useForm();

    const onSubmit = async (data) => {
        await fetch('/api/createComment', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(() => {
            console.log(data);
            setSubmitted(true);
        }).catch(err => {
            console.log(err);
            setSubmitted(false);
        })
    }


  return (
    <>
        <Header />
            <main>

                {post.mainImage && (
                    <img 
                        src={urlFor(post.mainImage).url()} 
                        alt=''
                        className="w-full h-40 object-cover"
                    />
                )}

                <article className="max-w-3xl mx-auto p-5">
                    <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
                    <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
                    
                    <div className="flex flex-col justify-center space-x-2">
                        {post.author.image && (
                            <img 
                                src={urlFor(post.author.image).url()} 
                                alt=""
                                className="h-10 w-10 rounded-full mt-2" 
                            />

                        )}
                        <p className="font-extralight text-sm mt-5">Blog post by {' '} <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>

                        <div className="mt-10">
                            <PortableText 
                                dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
                                projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
                                content={post.body}
                                serializers={{
                                    h1: (props) => (
                                    <h1 className="my-5 text-2xl font-bold" {...props} />
                                    ),
                                    h2: (props) => (
                                    <h2 className="my-5 text-xl font-bold" {...props} />
                                    ),
                                    li: ({ children }) => (
                                    <li className="ml-4 list-disc">{children}</li>
                                    ),
                                    link: ({ href, children }) => (
                                    <a href={href} className="text-blue-500 hover:underline">
                                        {children}
                                    </a>
                                    ),
                                }}
                        />
                        </div>

                    </div>
                </article>

                <hr className="max-w-lg my-5 mx-auto border border-yellow-500"/>

                {submitted ? (
                    <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold">Thank you for submitting your comment!</h3>
                        <p>Once it has been approved, it will appear below!</p>
                    </div>
                ): (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
                    <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
                    <h4 className="text-3xl font-bold">Leave a comment below!</h4>
                    <hr className="py-3 mt-2"/>

                    <input type="hidden" name="_id" value={post._id} {...register("_id")}/>

                    <label className="block mb-5">
                        <span className="text-gray-700">Name</span>
                        <input {...register("name", { required: true })} className="shadow border rounded py-2 px-3 outline-none form-input focus:ring mt-1 block w-full ring-yellow-500" placeholder="John Doe" type="text" />
                    </label>
                    <label className="block mb-5">
                        <span className="text-gray-700">Email</span>
                        <input {...register("email", { required: true })} className="shadow border rounded py-2 px-3 outline-none form-input focus:ring mt-1 block w-full ring-yellow-500" placeholder="Email" type="email" />
                    </label>
                    <label className="block mb-5">
                        <span className="text-gray-700">Comment</span>
                        <textarea {...register("comment", { required: true })} className="shadow border rounded py-2 px-3 form-textarea outline-none focus:ring mt-1 block w-full ring-yellow-500" placeholder="Comment" type="text" rows={8}/>
                    </label>

                    <div className="flex flex-col p-5">
                        {errors.name && <p className="text-red-500">Name is required</p>}
                        {errors.email && (
                            <p className="text-red-500">Email is required</p>
                        )}
                        {errors.comment && (
                            <p className="text-red-500">Comment is required</p>
                        )}
                    </div>

                    <input type="submit" className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"/>

                </form>
                )}

                {/* Comments */}

                <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 space-y-2">
                    <h3 className="text-4xl">Comments</h3>
                    <hr className="pb-2"/>

                    {post.comments.map(comment => (
                        <div key={comment._id}>
                            <p>
                                <span className="text-yellow-500">{comment.name}:</span>{' '}{comment.comment}
                            </p>
                        </div>
                    ))}
                </div>

                {console.log(post)}

            </main>
    </>
  )
}

export default Post;

export const getStaticPaths = async () => {
    const query = `
    *[_type == 'post'] {
        _id,
        slug {
          current,
        },
      }`

    const posts = await sanityClient.fetch(query);

    const paths = posts.map(post => (
        {
            params: {
                slug: post.slug.current
            }
        }
    ))

    return {
        paths,
        fallback: 'blocking',
    }
}

export const getStaticProps = async({ params }) => {
    const query = `
        *[_type=='post' && slug.current=='my-first-post'][0]{
            _id,
            _createdAt,
            title,
            author->{
                name,
                image
            },
            'comments':*[_type=='comment' && 
            post._ref==^._id &&
            approved ==true]
            ,
            description,
            mainImage,
            slug,
            body,
            
        } `
    const post = await sanityClient.fetch(query, {
        slug: params.slug,
    });

    if (!post) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            post,
        },
        revalidate: 60,
    }
}